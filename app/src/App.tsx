import React, { useState, useEffect } from 'react';
import { AppView, ExamAttempt, Module, User, Announcement } from './types';
import DashboardView from './components/dashboard/DashboardView';
import ModuleDetailView from './components/clases/ModuleDetailView';
import ExamSimulatorView from './components/exam/ExamSimulatorView';
import ExamReviewView from './components/exam/ExamReviewView';
import AuthView from './components/auth/AuthView';
import EditProfileView from './components/profile/EditProfileView';
import StudentDetailView from './components/admin/StudentDetailView';
import EditModuleView from './components/modules/EditModuleView';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [authReady, setAuthReady] = useState(false);
    const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);
    
    const [currentView, setCurrentView] = useState<AppView>('dashboard');
    const [lastAttempt, setLastAttempt] = useState<ExamAttempt | null>(null);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [moduleToEdit, setModuleToEdit] = useState<Module | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

    // Los módulos y anuncios ahora se cargan desde localStorage
    const [modules, setModules] = useState<Module[]>(() => {
        try { const saved = localStorage.getItem('modulesDB'); return saved ? JSON.parse(saved) : []; } catch { return []; }
    });
    const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
        try { const saved = localStorage.getItem('announcementsDB'); return saved ? JSON.parse(saved) : []; } catch { return []; }
    });

    useEffect(() => { localStorage.setItem('modulesDB', JSON.stringify(modules)); }, [modules]);
    useEffect(() => { localStorage.setItem('announcementsDB', JSON.stringify(announcements)); }, [announcements]);

    useEffect(() => {
        try {
            const loggedInUserJSON = localStorage.getItem('currentUser');
            if (loggedInUserJSON) {
                const loggedInUser = JSON.parse(loggedInUserJSON);
                const usersDB = JSON.parse(localStorage.getItem('usersDB') || '[]');
                if (usersDB.length > 0 && loggedInUser.email === usersDB[0].email) {
                    setIsPrimaryAdmin(true);
                }
                setCurrentUser(loggedInUser);
                if (loggedInUser.role === 'admin') setAllUsers(usersDB);
            }
        } catch (error) { console.error("Error al leer localStorage", error); } 
        finally { setAuthReady(true); }
    }, []);

    const handleLoginSuccess = (user: User, isNewUser: boolean) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        const usersDB = JSON.parse(localStorage.getItem('usersDB') || '[]');
        if (usersDB.length > 0 && user.email === usersDB[0].email) setIsPrimaryAdmin(true);
        if (user.role === 'admin') setAllUsers(usersDB);
        setCurrentView(isNewUser ? 'editProfile' : 'dashboard');
    };
    
    const handleProfileUpdate = (updatedUser: User) => {
        const usersDB: User[] = JSON.parse(localStorage.getItem('usersDB') || '[]');
        const userIndex = usersDB.findIndex((u) => u.email === updatedUser.email);
        if (userIndex !== -1) {
            usersDB[userIndex] = updatedUser;
            localStorage.setItem('usersDB', JSON.stringify(usersDB));
            if (updatedUser.role === 'admin') setAllUsers(usersDB);
        }
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setCurrentView('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setAllUsers([]);
        setIsPrimaryAdmin(false);
    };

    const handleExamComplete = (attempt: ExamAttempt) => {
        if (!currentUser) return;
        const attemptWithDate: ExamAttempt = { ...attempt, date: new Date().toISOString() };
        const usersDB: User[] = JSON.parse(localStorage.getItem('usersDB') || '[]');
        const userIndex = usersDB.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            const userToUpdate = usersDB[userIndex];
            userToUpdate.examHistory = [...(userToUpdate.examHistory || []), attemptWithDate];
            localStorage.setItem('usersDB', JSON.stringify(usersDB));
            const updatedCurrentUser = { ...currentUser, examHistory: userToUpdate.examHistory };
            localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
            setCurrentUser(updatedCurrentUser);
            if (currentUser.role === 'admin') setAllUsers(usersDB);
        }
        setLastAttempt(attemptWithDate);
        setCurrentView('review');
    };

    const handlePromoteUser = (userToPromote: User) => {
        if (!isPrimaryAdmin) return;
        const usersDB: User[] = JSON.parse(localStorage.getItem('usersDB') || '[]');
        const userIndex = usersDB.findIndex((u) => u.email === userToPromote.email);
        if (userIndex !== -1) {
            usersDB[userIndex].role = 'admin';
            localStorage.setItem('usersDB', JSON.stringify(usersDB));
            setAllUsers([...usersDB]); 
        }
    };
    
    const handleSaveModule = (moduleToSave: Module) => {
        setModules(prev => {
            const existingIndex = prev.findIndex(m => m.id === moduleToSave.id);
            return existingIndex !== -1 ? prev.map(m => m.id === moduleToSave.id ? moduleToSave : m) : [...prev, moduleToSave];
        });
        setCurrentView('dashboard');
        setModuleToEdit(null);
    };

    const handleDeleteModule = (moduleId: number) => {
        if (window.confirm("¿Seguro que quieres eliminar este módulo?")) {
            setModules(prev => prev.filter(m => m.id !== moduleId));
        }
    };

    const handleSaveAnnouncement = (content: string) => {
        const newAnnouncement: Announcement = { id: Date.now().toString(), content, date: new Date().toISOString() };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
    };

    const handleDeleteAnnouncement = (announcementId: string) => {
        setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    };

    const handleGoToDashboard = () => {
        setCurrentView('dashboard');
        setSelectedModule(null);
        setSelectedStudent(null);
        setModuleToEdit(null);
    };

    const handleStartExam = (module: Module) => {
        setSelectedModule(module);
        setCurrentView('exam');
    };

    const renderContent = () => {
        if (!authReady) return null;
        if (!currentUser) return <AuthView onLoginSuccess={handleLoginSuccess} />;

        switch (currentView) {
            case 'editProfile': return <EditProfileView user={currentUser} onProfileUpdate={handleProfileUpdate} />;
            case 'editModule': return <EditModuleView onSave={handleSaveModule} onCancel={handleGoToDashboard} existingModule={moduleToEdit} />;
            case 'module': return selectedModule && <ModuleDetailView module={selectedModule} onBack={handleGoToDashboard} />;
            case 'exam': return selectedModule?.quiz && <ExamSimulatorView quiz={selectedModule.quiz} onExamComplete={handleExamComplete} onBack={handleGoToDashboard} />;
            case 'review': return <ExamReviewView attempt={lastAttempt} onBack={handleGoToDashboard} />;
            case 'studentDetail': return selectedStudent && <StudentDetailView student={selectedStudent} onBack={handleGoToDashboard} />;
            default:
                return (
                    <DashboardView
                        currentUser={currentUser}
                        onLogout={handleLogout}
                        lastAttempt={lastAttempt}
                        onSelectModule={(module) => { setSelectedModule(module); setCurrentView('module'); }}
                        onStartExam={handleStartExam}
                        onGoToReview={() => { if (lastAttempt) setCurrentView('review'); }}
                        onEditProfile={() => setCurrentView('editProfile')}
                        allUsers={allUsers}
                        onSelectStudent={(student) => { setSelectedStudent(student); setCurrentView('studentDetail'); }}
                        isPrimaryAdmin={isPrimaryAdmin}
                        onPromoteUser={handlePromoteUser}
                        modules={modules}
                        announcements={announcements}
                        onEditModule={(module) => { setModuleToEdit(module); setCurrentView('editModule'); }}
                        onDeleteModule={handleDeleteModule}
                        onSaveAnnouncement={handleSaveAnnouncement}
                        onDeleteAnnouncement={handleDeleteAnnouncement}
                    />
                );
        }
    };

    return (
        <div className="bg-brand-black min-h-screen">
             <main className="p-4 sm:p-6 lg:p-8">
                 <div className="max-w-4xl mx-auto">
                    {renderContent()}
                 </div>
            </main>
        </div>
    );
};

export default App;