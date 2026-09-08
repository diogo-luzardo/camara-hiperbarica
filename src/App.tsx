import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PatientList } from './components/PatientList';
import { PatientDetailView } from './components/PatientDetailView';
import { AppointmentManager } from './components/AppointmentManager';
import { DigitalVault } from './components/DigitalVault';
import { PatientFormModal } from './components/PatientFormModal';
import { SessionFormModal } from './components/SessionFormModal';
import { PrintSheetModal } from './components/PrintSheetModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { StorageService } from './services/storage';
import { Patient, HyperbaricSession, Appointment, DigitalizedDocument } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<'pacientes' | 'agendamentos' | 'acervo' | 'arquitetura'>('pacientes');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<HyperbaricSession[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<DigitalizedDocument[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Modals state
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionPatient, setSessionPatient] = useState<Patient | null>(null);
  const [editingSession, setEditingSession] = useState<HyperbaricSession | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState<'tratamento' | 'agendamento' | 'enfermagem'>('tratamento');
  const [printPatient, setPrintPatient] = useState<Patient | null>(null);

  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  // Vault jump filter
  const [vaultTargetOHB, setVaultTargetOHB] = useState<string | undefined>(undefined);

  // Initial Load from StorageService
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const p = StorageService.getPatients();
    const s = StorageService.getSessions();
    const a = StorageService.getAppointments();
    setPatients(p);
    setSessions(s);
    setAppointments(a);

    try {
      const docs = await StorageService.getAllDigitalizedDocs();
      setDocuments(docs);
    } catch (e) {
      console.error('Erro ao carregar documentos do IndexedDB:', e);
    }
  };

  // Patients Actions
  const handleSavePatient = (patient: Patient) => {
    StorageService.savePatient(patient);
    setPatients(StorageService.getPatients());
    setIsPatientModalOpen(false);
    setEditingPatient(null);
  };

  const handleOpenNewPatient = () => {
    setEditingPatient(null);
    setIsPatientModalOpen(true);
  };

  const handleOpenEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsPatientModalOpen(true);
  };

  // Sessions Actions
  const handleOpenNewSession = (patient: Patient) => {
    setSessionPatient(patient);
    setEditingSession(null);
    setIsSessionModalOpen(true);
  };

  const handleSaveSession = (session: HyperbaricSession) => {
    StorageService.saveSession(session);
    setSessions(StorageService.getSessions());
    setIsSessionModalOpen(false);
    setSessionPatient(null);
    setEditingSession(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Deseja excluir este registro de sessão hiperbárica?')) {
      StorageService.deleteSession(sessionId);
      setSessions(StorageService.getSessions());
    }
  };

  // Appointments Actions
  const handleSaveAppointment = (appointment: Appointment) => {
    StorageService.saveAppointment(appointment);
    setAppointments(StorageService.getAppointments());
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (confirm('Deseja cancelar e remover este agendamento?')) {
      StorageService.deleteAppointment(appointmentId);
      setAppointments(StorageService.getAppointments());
    }
  };

  // Digital Vault actions
  const handleRefreshDocs = async () => {
    const docs = await StorageService.getAllDigitalizedDocs();
    setDocuments(docs);
  };

  const handleUploadDocForPatient = (registroOHB: string) => {
    setVaultTargetOHB(registroOHB);
    setActiveView('acervo');
  };

  // Printing Sheets
  const handleOpenPrintSheet = (
    type: 'tratamento' | 'agendamento' | 'enfermagem',
    patient: Patient
  ) => {
    setPrintType(type);
    setPrintPatient(patient);
    setIsPrintModalOpen(true);
  };

  // Selected Patient Details
  const currentPatient = patients.find((p) => p.id === selectedPatientId);
  const currentPatientSessions = sessions.filter((s) => s.patientId === selectedPatientId);
  const currentPatientAppointments = appointments.filter((a) => a.patientId === selectedPatientId);
  const currentPatientDocs = documents.filter(
    (d) =>
      d.patientId === selectedPatientId ||
      (currentPatient && d.registroOHB === currentPatient.registroOHB)
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Navigation Bar */}
      <Navbar
        activeView={activeView}
        onNavigate={(view) => {
          if (view === 'arquitetura') {
            setIsArchModalOpen(true);
          } else {
            setActiveView(view);
            if (view === 'pacientes') {
              // Maintain or clear patient depending on user action
            }
          }
        }}
        onNewPatient={handleOpenNewPatient}
        patientCount={patients.length}
        sessionCount={sessions.length}
        appointmentCount={appointments.length}
        documentCount={documents.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* VIEW 1: PACIENTES */}
        {activeView === 'pacientes' && (
          <>
            {selectedPatientId && currentPatient ? (
              <PatientDetailView
                patient={currentPatient}
                sessions={currentPatientSessions}
                appointments={currentPatientAppointments}
                documents={currentPatientDocs}
                onBack={() => setSelectedPatientId(null)}
                onEditPatient={handleOpenEditPatient}
                onNewSession={handleOpenNewSession}
                onNewAppointment={(p) => {
                  setActiveView('agendamentos');
                }}
                onUploadDocForPatient={handleUploadDocForPatient}
                onDeleteSession={handleDeleteSession}
                onPrintSheet={handleOpenPrintSheet}
              />
            ) : (
              <PatientList
                patients={patients}
                sessions={sessions}
                appointments={appointments}
                onSelectPatient={(id) => setSelectedPatientId(id)}
                onNewPatient={handleOpenNewPatient}
                onNewSession={handleOpenNewSession}
              />
            )}
          </>
        )}

        {/* VIEW 2: AGENDAMENTOS */}
        {activeView === 'agendamentos' && (
          <AppointmentManager
            appointments={appointments}
            patients={patients}
            onSaveAppointment={handleSaveAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            onSelectPatient={(patientId) => {
              setSelectedPatientId(patientId);
              setActiveView('pacientes');
            }}
            onPrintAppointmentSheet={(patientName, appList) => {
              const pat = patients.find((p) => p.nome === patientName) || patients[0];
              if (pat) {
                handleOpenPrintSheet('agendamento', pat);
              }
            }}
          />
        )}

        {/* VIEW 3: ACERVO DIGITAL (PRONTUÁRIOS ANTIGOS ESCANEADOS) */}
        {activeView === 'acervo' && (
          <DigitalVault
            documents={documents}
            patients={patients}
            onRefreshDocs={handleRefreshDocs}
            selectedPatientOHB={vaultTargetOHB}
          />
        )}
      </main>

      {/* MODAL: CADASTRO / EDIÇÃO DE PACIENTE (COM CPF E VIACEP) */}
      <PatientFormModal
        isOpen={isPatientModalOpen}
        onClose={() => {
          setIsPatientModalOpen(false);
          setEditingPatient(null);
        }}
        onSave={handleSavePatient}
        initialPatient={editingPatient}
        existingPatients={patients}
      />

      {/* MODAL: REGISTRO DE SESSÃO OHB & SAE */}
      {sessionPatient && (
        <SessionFormModal
          isOpen={isSessionModalOpen}
          onClose={() => {
            setIsSessionModalOpen(false);
            setSessionPatient(null);
            setEditingSession(null);
          }}
          onSave={handleSaveSession}
          patient={sessionPatient}
          nextSessionNumber={
            sessions.filter((s) => s.patientId === sessionPatient.id).length + 1
          }
          initialSession={editingSession}
        />
      )}

      {/* MODAL: IMPRESSÃO TIMBRADA OFICIAL */}
      {printPatient && (
        <PrintSheetModal
          isOpen={isPrintModalOpen}
          onClose={() => {
            setIsPrintModalOpen(false);
            setPrintPatient(null);
          }}
          type={printType}
          patient={printPatient}
          sessions={sessions.filter((s) => s.patientId === printPatient.id)}
          appointments={appointments.filter((a) => a.patientId === printPatient.id)}
        />
      )}

      {/* MODAL: ARQUITETURA AWS / JAVA / POSTGRESQL / S3 */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
}
