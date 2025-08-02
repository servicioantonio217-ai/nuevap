export type AppView = 'dashboard' | 'module' | 'exam' | 'review' | 'editProfile' | 'studentDetail' | 'editModule';

export interface User {
    email: string;
    password?: string;
    role: 'admin' | 'student';
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    nationality?: string;
    profilePicture?: string;
    examHistory?: ExamAttempt[];
}

export interface StudyMaterial {
    name: string;
    type: string;
    data: string;
}

export interface ExamQuestion {
    id: string;
    pregunta: string;
    opciones: string[];
    respuestaCorrecta: string;
}

export interface Module {
    id: number;
    title: string;
    description: string;
    iconName: string;
    videoUrl?: string;
    content?: string; // Contenido escrito por el admin
    materials?: StudyMaterial[];
    quiz?: ExamQuestion[]; // Cuestionario creado por el admin
}

export interface Announcement {
    id: string;
    content: string;
    date: string;
}

export interface ExamAttempt {
    questions: ExamQuestion[];
    userAnswers: Record<string, string>; // Usa el ID de la pregunta
    score: number;
    date?: string;
}