import React from 'react';
import { Module, ExamAttempt, User, Announcement } from '../../types';
import Card from '../common/Card';
import { iconMap, CheckCircleIcon, TargetIcon, LogOutIcon, UserIcon, EditIcon, MegaphoneIcon, BookOpenIcon } from '../icons';
import AdminPanel from '../admin/AdminPanel';

const WelcomeBanner: React.FC<{ user: User; onLogout: () => void; onEditProfile: () => void; }> = ({ user, onLogout, onEditProfile }) => ( <div className="bg-brand-gray-dark p-6 rounded-2xl flex items-center justify-between mb-8 shadow-lg"> <div className="flex items-center gap-4"> {user.profilePicture ? ( <img src={user.profilePicture} alt="Perfil" className="h-16 w-16 rounded-full object-cover border-2 border-brand-red" /> ) : ( <div className="h-16 w-16 rounded-full bg-brand-gray flex items-center justify-center border-2 border-gray-600"> <UserIcon className="h-8 w-8 text-gray-400" /> </div> )} <div> <h1 className="text-2xl font-bold text-gray-100">Hola, {user.firstName || user.email.split('@')[0]}</h1> <p className="text-gray-400 mt-1">Listo para una nueva lección.</p> </div> </div> <div className="flex gap-2"> <button onClick={onEditProfile} title="Editar Perfil" className="flex items-center gap-2 bg-brand-gray p-2 rounded-lg text-white hover:bg-gray-600 transition-colors"> <EditIcon className="h-5 w-5" /> <span className="hidden sm:inline font-semibold">Editar</span> </button> <button onClick={onLogout} title="Cerrar Sesión" className="flex items-center gap-2 bg-brand-red p-2 rounded-lg text-white hover:bg-brand-red-dark transition-colors"> <LogOutIcon className="h-5 w-5" /> <span className="hidden sm:inline font-semibold">Salir</span> </button> </div> </div> );
const AnnouncementBanner: React.FC<{ announcement: Announcement }> = ({ announcement }) => ( <Card className="bg-red-900/50 border border-brand-red/50 mb-8"> <div className="p-4 flex gap-4 items-center"> <MegaphoneIcon className="h-8 w-8 text-brand-red flex-shrink-0" /> <div> <h3 className="font-bold text-red-200">Anuncio Reciente</h3> <p className="text-white">{announcement.content}</p> </div> </div> </Card> );
interface StatCardProps { title: string; value: string; icon: React.ReactNode; onClick?: () => void; }
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, onClick }) => ( <Card className="text-white bg-brand-gray" onClick={onClick}> <div className="p-4"> <div className="flex items-center justify-between mb-2"> <span className="text-lg font-bold">{value}</span> {icon} </div> <p className="font-medium text-sm">{title}</p> </div> </Card> );

interface DashboardViewProps { currentUser: User; onLogout: () => void; lastAttempt: ExamAttempt | null; onSelectModule: (module: Module) => void; onStartExam: (module: Module) => void; onGoToReview: () => void; onEditProfile: () => void; allUsers: User[]; onSelectStudent: (user: User) => void; isPrimaryAdmin: boolean; onPromoteUser: (user: User) => void; modules: Module[]; announcements: Announcement[]; onEditModule: (module: Module | null) => void; onDeleteModule: (id: number) => void; onSaveAnnouncement: (content: string) => void; onDeleteAnnouncement: (id: string) => void; }

const DashboardView: React.FC<DashboardViewProps> = (props) => {
    const { currentUser, onLogout, lastAttempt, onSelectModule, onStartExam, onGoToReview, onEditProfile, allUsers, onSelectStudent, isPrimaryAdmin, onPromoteUser, modules, announcements, onEditModule, onDeleteModule, onSaveAnnouncement, onDeleteAnnouncement } = props;
    const scoreText = lastAttempt ? `${lastAttempt.score}/${lastAttempt.questions.length}` : 'N/A';
    const latestAnnouncement = announcements[0] || null;
    const IconComponent = ({ iconName }: { iconName: string }) => { const Icon = iconMap[iconName] || BookOpenIcon; return <Icon className="h-7 w-7 text-brand-red" />; };

    return (
        <div>
            <WelcomeBanner user={currentUser} onLogout={onLogout} onEditProfile={onEditProfile} />
            {latestAnnouncement && <AnnouncementBanner announcement={latestAnnouncement} />}
            <h2 className="text-xl font-bold text-gray-200 mb-4">Resumen</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <StatCard title="Última Puntuación" value={scoreText} icon={<TargetIcon className="h-8 w-8 opacity-80"/>} />
                <StatCard title="Módulos Disponibles" value={`${modules.length}`} icon={<BookOpenIcon className="h-8 w-8 opacity-80"/>} />
                <StatCard title="Repaso de Examen" value="Ver" icon={<CheckCircleIcon className="h-8 w-8 opacity-80"/>} onClick={lastAttempt ? onGoToReview : undefined} />
            </div>
            <h2 className="text-xl font-bold text-gray-200 mb-4">Módulos de Estudio</h2>
            <div className="space-y-4">
                {modules.map((module) => (
                    <Card key={module.id}>
                        <div className="p-4 flex flex-col sm:flex-row items-center gap-5">
                            <div className="flex-grow text-center sm:text-left cursor-pointer flex items-center gap-5" onClick={() => onSelectModule(module)}>
                                <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-brand-gray-dark flex items-center justify-center border border-gray-600"> <IconComponent iconName={module.iconName} /> </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-100">{module.title}</h3>
                                    <p className="text-gray-400 text-sm">{module.description}</p>
                                </div>
                            </div>
                            {module.quiz && module.quiz.length > 0 && (
                                <button onClick={() => onStartExam(module)} className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 bg-brand-red text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-red-dark transition-colors"> Tomar Examen </button>
                            )}
                        </div>
                    </Card>
                ))}
                 {modules.length === 0 && <Card className="text-center"><p className="p-6 text-gray-400">El administrador aún no ha creado módulos.</p></Card>}
            </div>
            {currentUser.role === 'admin' && ( <AdminPanel users={allUsers} onSelectStudent={onSelectStudent} isPrimaryAdmin={isPrimaryAdmin} onPromoteUser={onPromoteUser} modules={modules} announcements={announcements} onEditModule={onEditModule} onDeleteModule={onDeleteModule} onSaveAnnouncement={onSaveAnnouncement} onDeleteAnnouncement={onDeleteAnnouncement} /> )}
        </div>
    );
};
export default DashboardView;