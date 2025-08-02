import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Module, StudyMaterial, ExamQuestion } from '../../types';
import Card from '../common/Card';
import { iconMap, UploadIcon, TrashIcon, PlusIcon } from '../icons';

interface EditModuleViewProps { onSave: (module: Module) => void; onCancel: () => void; existingModule: Module | null; }
const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result as string); reader.onerror = error => reject(error); });

const EditModuleView: React.FC<EditModuleViewProps> = ({ onSave, onCancel, existingModule }) => {
    const [title, setTitle] = useState(existingModule?.title || '');
    const [description, setDescription] = useState(existingModule?.description || '');
    const [iconName, setIconName] = useState(existingModule?.iconName || 'BookOpenIcon');
    const [videoUrl, setVideoUrl] = useState(existingModule?.videoUrl || '');
    const [content, setContent] = useState(existingModule?.content || '');
    const [materials, setMaterials] = useState<StudyMaterial[]>(existingModule?.materials || []);
    const [quiz, setQuiz] = useState<ExamQuestion[]>(existingModule?.quiz || []);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files; if (!files) return;
        const newMaterials: StudyMaterial[] = [];
        for (const file of Array.from(files)) {
            if (file.size > 5 * 1024 * 1024) { setError(`Archivo ${file.name} excede 5MB.`); continue; }
            const base64 = await fileToBase64(file);
            newMaterials.push({ name: file.name, type: file.type, data: base64.split(',')[1] });
        }
        setMaterials(prev => [...prev, ...newMaterials]);
    };

    const addQuestion = () => setQuiz(prev => [...prev, { id: Date.now().toString(), pregunta: '', opciones: ['', '', '', ''], respuestaCorrecta: '' }]);
    const handleQuestionChange = (qIndex: number, value: string) => setQuiz(prev => prev.map((q, i) => i === qIndex ? { ...q, pregunta: value } : q));
    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => setQuiz(prev => prev.map((q, i) => i === qIndex ? { ...q, opciones: q.opciones.map((opt, j) => j === oIndex ? value : opt) } : q));
    const setCorrectAnswer = (qIndex: number, value: string) => setQuiz(prev => prev.map((q, i) => i === qIndex ? { ...q, respuestaCorrecta: value } : q));
    const removeQuestion = (qIndex: number) => setQuiz(prev => prev.filter((_, i) => i !== qIndex));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) { setError("Título y descripción son obligatorios."); return; }
        const finalQuiz = quiz.filter(q => q.pregunta.trim() && q.opciones.every(opt => opt.trim()) && q.respuestaCorrecta.trim());
        onSave({ id: existingModule?.id || Date.now(), title, description, iconName, videoUrl, content, materials, quiz: finalQuiz });
    };

    return ( <Card> <form onSubmit={handleSubmit} className="p-8 space-y-6"> <h2 className="text-3xl font-bold text-center text-gray-100">{existingModule ? 'Editar' : 'Crear'} Módulo</h2> <div> <label className="block text-sm font-medium text-gray-300">Título</label> <input value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-brand-gray-dark border border-gray-600 rounded-md text-white" /> </div> <div> <label className="block text-sm font-medium text-gray-300">Descripción</label> <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={2} className="mt-1 block w-full px-3 py-2 bg-brand-gray-dark border border-gray-600 rounded-md text-white" /> </div> <div> <label className="block text-sm font-medium text-gray-300">Contenido del Módulo</label> <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} className="mt-1 block w-full px-3 py-2 bg-brand-gray-dark border border-gray-600 rounded-md text-white" placeholder="Escribe el contenido de la lección aquí..."/> </div> <div className="grid md:grid-cols-2 gap-6"> <div><label className="block text-sm font-medium text-gray-300">Icono</label><select value={iconName} onChange={e => setIconName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-brand-gray-dark border border-gray-600 rounded-md text-white">{Object.keys(iconMap).map(name => <option key={name} value={name}>{name.replace('Icon', '')}</option>)}</select></div> <div><label className="block text-sm font-medium text-gray-300">URL Video YouTube</label><input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/embed/..." className="mt-1 block w-full px-3 py-2 bg-brand-gray-dark border border-gray-600 rounded-md text-white" /></div> </div> <div> <label className="block text-sm font-medium text-gray-300 mb-2">Material de Estudio</label> <label htmlFor="file-upload" className="relative cursor-pointer bg-brand-gray border-2 border-dashed border-gray-600 rounded-md flex justify-center p-6 hover:border-brand-red"><div className="text-center"><UploadIcon className="mx-auto h-10 w-10 text-gray-400" /><span className="mt-2 block text-sm text-gray-300">Sube archivos</span></div><input id="file-upload" type="file" multiple onChange={handleFileChange} className="sr-only" /></label></div> {materials.length > 0 && <div className="space-y-2">{materials.map((mat, i) => <div key={i} className="flex justify-between bg-brand-gray-dark p-2 rounded"><span className="text-gray-200 text-sm truncate">{mat.name}</span><button type="button" onClick={() => setMaterials(prev => prev.filter((_, j) => i !== j))} className="p-1 text-gray-400 hover:text-brand-red"><TrashIcon className="h-4 w-4" /></button></div>)}</div>} <div className="border-t border-gray-700 pt-6"> <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-gray-100">Cuestionario del Módulo</h3><button type="button" onClick={addQuestion} className="flex items-center gap-2 bg-brand-red text-white font-bold py-2 px-3 rounded-lg hover:bg-brand-red-dark"><PlusIcon className="h-5 w-5" />Añadir Pregunta</button></div> <div className="space-y-6"> {quiz.map((q, qIndex) => ( <div key={q.id} className="bg-brand-gray-dark p-4 rounded-lg space-y-3"> <div className="flex justify-between items-start"> <textarea value={q.pregunta} onChange={e => handleQuestionChange(qIndex, e.target.value)} placeholder={`Pregunta ${qIndex + 1}`} rows={2} className="flex-grow bg-brand-gray border border-gray-600 rounded-md text-white p-2 mr-2" /> <button type="button" onClick={() => removeQuestion(qIndex)} className="p-2 text-gray-400 hover:text-brand-red"><TrashIcon className="h-5 w-5" /></button> </div> {q.opciones.map((opt, oIndex) => <div key={oIndex} className="flex items-center gap-2"><input type="text" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Opción ${oIndex + 1}`} className="w-full bg-brand-gray border border-gray-600 rounded-md text-white p-2" /><input title={`Marcar opción ${oIndex+1} como correcta`} type="radio" name={`correctAnswer_${q.id}`} checked={q.respuestaCorrecta === opt && q.respuestaCorrecta !== ''} onChange={() => setCorrectAnswer(qIndex, opt)} className="form-radio h-5 w-5 text-brand-red bg-gray-700 border-gray-600 focus:ring-brand-red"/></div>)} </div> ))} {quiz.length === 0 && <p className="text-center text-gray-500 py-4">No hay preguntas en el cuestionario.</p>} </div> </div> {error && <p className="text-sm text-red-500 text-center">{error}</p>} <div className="flex justify-end gap-4 pt-6"> <button type="button" onClick={onCancel} className="py-2 px-4 rounded-md text-gray-200 bg-brand-gray hover:bg-gray-600">Cancelar</button> <button type="submit" className="py-2 px-4 rounded-md text-white bg-brand-red hover:bg-brand-red-dark">Guardar Módulo</button> </div> </form> </Card> );
};
export default EditModuleView;