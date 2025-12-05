import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import CardAddonForm from '../../components/admin/CardAddonForm.tsx';
import { CardAddon } from '../../types.ts';

const CardAddonFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { cardAddons, fetchCardAddons } = useAppContext();
    const [addon, setAddon] = useState<CardAddon | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(!!id);

    useEffect(() => {
        const load = async () => {
            if (cardAddons.length === 0) {
                await fetchCardAddons();
            }
            setIsLoading(false);
        };
        load();
    }, [fetchCardAddons, cardAddons.length]);

    useEffect(() => {
        if (id && cardAddons.length > 0) {
            const found = cardAddons.find(a => a.id === id);
            setAddon(found);
        }
    }, [id, cardAddons]);

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                {id ? 'Edit Card Addon' : 'Create New Card Addon'}
            </h1>
            <CardAddonForm initialData={addon} isEditing={!!id} />
        </div>
    );
};

export default CardAddonFormPage;
