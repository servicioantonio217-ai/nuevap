import React, { useState } from 'react';
import { ExamQuestion, ExamAttempt } from '../../types';
import Card from '../common/Card';
import { ArrowLeftIcon } from '../icons';

interface ExamSimulatorViewProps { 
    quiz: ExamQuestion[]; 
    onExamComplete: (attempt: ExamAttempt) => void; 
    onBack: () => void; 
}

const ExamSimulatorView: React.FC<ExamSimulatorViewProps> = ({ quiz, onExamComplete, onBack }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

    const handleAnswerSelect = (questionId: string, answer: string) => { 
        setSelectedAnswers(prev => ({ ...prev, [questionId]: answer })); 
    };

    const handleSubmit = () => {
        let score = 0;
        quiz.forEach(q => { if (selectedAnswers[q.id] === q.respuestaCorrecta) score++; });
        onExamComplete({ questions: quiz, userAnswers: selectedAnswers, score });
    };

    return ( 
        <Card className="w-full max-w-4xl mx-auto"> 
            <div className="p-6"> 
                <button onClick={onBack} className="flex items-center gap-2 text-brand-red hover:text-red-400 font-semibold mb-6"> 
                    <ArrowLeftIcon className="h-5 w-5" /> Cancelar Examen 
                </button> 
                <div className="space-y-8"> 
                    {quiz.map((q, qIndex) => ( 
                        <div key={q.id}> 
                            <p className="text-lg font-semibold text-gray-100 mb-4">{qIndex + 1}. {q.pregunta}</p> 
                            <div className="space-y-3"> 
                                {q.opciones.map((option, oIndex) => ( 
                                    <button key={oIndex} onClick={() => handleAnswerSelect(q.id, option)} className={`w-full text-left p-3 border-2 rounded-lg transition-colors text-gray-200 ${selectedAnswers[q.id] === option ? 'bg-red-900 border-brand-red' : 'bg-brand-gray border-gray-600 hover:bg-gray-600'}`}> 
                                        {option} 
                                    </button> 
                                ))} 
                            </div> 
                        </div> 
                    ))} 
                    <div className="text-center pt-6 border-t border-gray-700 mt-8"> 
                        <button onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length !== quiz.length} className="bg-brand-red text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-red-dark disabled:bg-red-900 disabled:text-gray-500 disabled:cursor-not-allowed"> 
                            Finalizar y Corregir 
                        </button> 
                    </div> 
                </div> 
            </div> 
        </Card> 
    );
};
export default ExamSimulatorView;