import React from 'react';
import { Module } from '../../types';
import Card from '../common/Card';
import { ArrowLeftIcon, DownloadIcon } from '../icons';

interface ModuleDetailViewProps { module: Module; onBack: () => void; }

const ModuleDetailView: React.FC<ModuleDetailViewProps> = ({ module, onBack }) => {
    const renderFormattedContent = (text: string) => {
        return text.split('\n').map((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                return <li key={index} className="text-gray-300 ml-5 list-disc">{trimmedLine.substring(2)}</li>;
            }
            if (trimmedLine.length > 0) {
                 return <p key={index} className="text-gray-300 mb-4 leading-relaxed">{trimmedLine}</p>;
            }
            return <br key={index} />;
        });
    };

    return ( 
        <Card> 
            <div className="p-6"> 
                <button onClick={onBack} className="flex items-center gap-2 text-brand-red hover:text-red-400 font-semibold mb-6"> 
                    <ArrowLeftIcon className="h-5 w-5" /> Volver al Dashboard 
                </button> 
                <h2 className="text-3xl font-bold text-gray-100 mb-6">{module.title}</h2> 
                {module.videoUrl && ( 
                    <div className="mb-8 aspect-w-16 aspect-h-9"> 
                        <iframe className="w-full aspect-video rounded-lg shadow-lg" src={module.videoUrl} title={`Video para ${module.title}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe> 
                    </div> 
                )} 
                {module.materials && module.materials.length > 0 && ( 
                    <div className="mb-8"> 
                        <h3 className="text-xl font-bold text-gray-100 mb-4">Material de Estudio</h3> 
                        <div className="space-y-3"> 
                            {module.materials.map((material, index) => ( 
                                <a key={index} href={`data:${material.type};base64,${material.data}`} download={material.name} className="bg-brand-gray-dark p-3 rounded-lg flex items-center justify-between hover:bg-gray-600 transition-colors"> 
                                    <span className="text-gray-200 font-medium">{material.name}</span> 
                                    <DownloadIcon className="h-6 w-6 text-brand-red" /> 
                                </a> 
                            ))} 
                        </div> 
                    </div> 
                )} 
                <h3 className="text-xl font-bold text-gray-100 mb-4">Contenido del Módulo</h3> 
                <div className="prose max-w-none text-gray-300"> 
                    {module.content ? renderFormattedContent(module.content) : <p>Este módulo aún no tiene contenido.</p>} 
                </div> 
            </div> 
        </Card> 
    );
};
export default ModuleDetailView;