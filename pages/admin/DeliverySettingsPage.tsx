import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import Breadcrumb from '../../components/Breadcrumb';
import { MasterLocation, ServiceableRule } from '../../types';

const DeliverySettingsPage: React.FC = () => {
    const {
        deliverySettings, updateDeliverySettings,
        serviceableRules, addServiceableRule, removeServiceableRule,
        fetchUniqueStates, fetchCitiesByState, fetchPincodesByCity
    } = useAppContext();

    const [isAllIndia, setIsAllIndia] = useState(false);
    const [storeCity, setStoreCity] = useState('');
    const [storeState, setStoreState] = useState('');
    const [storeAddress, setStoreAddress] = useState('');

    // --- Browser State ---
    const [allStates, setAllStates] = useState<string[]>([]);
    const [activeState, setActiveState] = useState<string | null>(null);

    const [citiesInState, setCitiesInState] = useState<string[]>([]);
    const [activeCity, setActiveCity] = useState<string | null>(null);

    const [pincodesInCity, setPincodesInCity] = useState<string[]>([]);
    const [isLoadingPincodes, setIsLoadingPincodes] = useState(false);

    // --- Search State ---
    const [stateSearchTerm, setStateSearchTerm] = useState('');
    const [citySearchTerm, setCitySearchTerm] = useState('');
    const [showSummary, setShowSummary] = useState(true);

    // Initial Load
    useEffect(() => {
        loadStates();
    }, []);

    useEffect(() => {
        if (activeState) {
            loadCities(activeState);
        } else {
            setCitiesInState([]);
            setActiveCity(null);
        }
    }, [activeState]);

    useEffect(() => {
        if (activeCity && activeState) {
            loadPincodes(activeCity, activeState);
        } else {
            setPincodesInCity([]);
        }
    }, [activeCity, activeState]);

    useEffect(() => {
        if (deliverySettings) {
            setIsAllIndia(deliverySettings.is_all_india_serviceable ?? false);
            setStoreCity(deliverySettings.store_city || '');
            setStoreState(deliverySettings.store_state || '');
            setStoreAddress(deliverySettings.store_address || '');
        }
    }, [deliverySettings]);

    const loadStates = async () => {
        const states = await fetchUniqueStates();
        setAllStates(states);
    };

    const loadCities = async (stateVal: string) => {
        const cities = await fetchCitiesByState(stateVal);
        setCitiesInState(cities);
    };

    const loadPincodes = async (cityVal: string, stateVal: string) => {
        setIsLoadingPincodes(true);
        const pins = await fetchPincodesByCity(stateVal, cityVal);
        setPincodesInCity(pins);
        setIsLoadingPincodes(false);
    };

    const handleSaveGeneral = async () => {
        await updateDeliverySettings({
            is_all_india_serviceable: isAllIndia,
            store_city: storeCity,
            store_state: storeState,
            store_address: storeAddress
        });
        alert("Settings Saved!");
    };

    // --- Checkbox Logic ---

    const isStateAllowed = (stateVal: string) => {
        return serviceableRules.some(r => r.rule_type === 'state' && r.value === stateVal && r.is_allowed);
    };

    const isCityAllowed = (cityVal: string, parentState: string) => {
        const cityRule = serviceableRules.find(r => r.rule_type === 'city' && r.value === cityVal && r.parent_value === parentState);
        if (cityRule) return cityRule.is_allowed;
        if (isStateAllowed(parentState)) return true;
        return false;
    };

    const isCityImplicitlyAllowed = (cityVal: string, parentState: string) => {
        return isStateAllowed(parentState) &&
            !serviceableRules.some(r => r.rule_type === 'city' && r.value === cityVal);
    }

    const toggleState = async (stateVal: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentStatus) {
            const rule = serviceableRules.find(r => r.rule_type === 'state' && r.value === stateVal);
            if (rule) await removeServiceableRule(rule.id, true);
        } else {
            await addServiceableRule({
                rule_type: 'state',
                value: stateVal,
                is_allowed: true
            });
        }
    };

    const toggleCity = async (cityVal: string, parentState: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isCityImplicitlyAllowed(cityVal, parentState)) {
            alert(`This city is enabled because the entire state of ${parentState} is enabled. Uncheck the State to manage individual cities.`);
            return;
        }
        if (currentStatus) {
            const rule = serviceableRules.find(r => r.rule_type === 'city' && r.value === cityVal && r.parent_value === parentState);
            if (rule) await removeServiceableRule(rule.id, true);
        } else {
            await addServiceableRule({
                rule_type: 'city',
                value: cityVal,
                parent_value: parentState,
                is_allowed: true
            });
        }
    };

    // --- Search Filtering ---
    const filteredStates = useMemo(() => {
        if (!stateSearchTerm) return allStates;
        return allStates.filter(s => s.toLowerCase().includes(stateSearchTerm.toLowerCase()));
    }, [allStates, stateSearchTerm]);

    const filteredCities = useMemo(() => {
        if (!citySearchTerm) return citiesInState;
        return citiesInState.filter(c => c.toLowerCase().includes(citySearchTerm.toLowerCase()));
    }, [citiesInState, citySearchTerm]);


    // --- Summary Data ---
    const summaryData = useMemo(() => {
        const enabledStates = serviceableRules.filter(r => r.rule_type === 'state' && r.is_allowed).map(r => r.value);
        const enabledCities = serviceableRules.filter(r => r.rule_type === 'city' && r.is_allowed);

        // Group cities by state parent
        const citiesByState: Record<string, number> = {};
        enabledCities.forEach(c => {
            const parent = c.parent_value || 'Unknown';
            citiesByState[parent] = (citiesByState[parent] || 0) + 1;
        });

        // Add implicit "all cities" logic to summary is tricky without fetching counts, 
        // so for now we just show explicit States and explicit Cities.
        // User asked for "Show selected states and count of cities".

        return {
            stateCount: enabledStates.length,
            cityCount: enabledCities.length,
            states: enabledStates,
            cityMap: citiesByState
        };
    }, [serviceableRules]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Breadcrumb />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Delivery & Locations</h1>
                {!isAllIndia && (
                    <button
                        onClick={() => setShowSummary(!showSummary)}
                        className="text-sm text-primary hover:underline font-medium"
                    >
                        {showSummary ? 'Hide Summary' : 'Show Summary'}
                    </button>
                )}
            </div>

            {/* General Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Store Configuration</h2>
                    <button
                        onClick={handleSaveGeneral}
                        className="px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary-dark transition-colors"
                    >
                        Save Settings
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Store City</label>
                        <input
                            type="text"
                            placeholder="e.g. Pune"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-primary focus:border-primary"
                            value={storeCity}
                            onChange={e => setStoreCity(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Used for "Local Order" detection.</p>
                    </div>
                    <div className="flex items-center gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <input
                            type="checkbox"
                            id="allIndia"
                            checked={isAllIndia}
                            onChange={e => setIsAllIndia(e.target.checked)}
                            className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <div>
                            <label htmlFor="allIndia" className="font-semibold text-gray-900 dark:text-white block">
                                Enable All India Delivery
                            </label>
                            <p className="text-xs text-gray-500">Overrides all location rules below.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Card */}
            {showSummary && !isAllIndia && (summaryData.stateCount > 0 || summaryData.cityCount > 0) && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-blue-100 dark:border-gray-600 mb-8 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Service Areas Summary</h3>
                    <div className="flex gap-8 mb-4">
                        <div>
                            <span className="text-3xl font-bold text-primary">{summaryData.stateCount}</span>
                            <p className="text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide font-semibold">Verified States</p>
                        </div>
                        <div>
                            <span className="text-3xl font-bold text-green-600 dark:text-green-400">{summaryData.cityCount}</span>
                            <p className="text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide font-semibold">Special Cities</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto no-scrollbar">
                        {summaryData.states.map(s => (
                            <span key={s} className="px-3 py-1 bg-white dark:bg-gray-600 border border-blue-100 dark:border-gray-500 rounded-full text-xs font-medium text-gray-700 dark:text-gray-200">
                                {s}
                            </span>
                        ))}
                        {Object.keys(summaryData.cityMap).map(state => (
                            <span key={state} className="px-3 py-1 bg-white dark:bg-gray-600 border border-green-100 dark:border-gray-500 rounded-full text-xs font-medium text-gray-700 dark:text-gray-200 border-l-4 border-l-green-400">
                                {state}: {summaryData.cityMap[state]} cities
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Serviceable Areas Browser */}
            {!isAllIndia && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row h-[700px]">

                    {/* 1. States List */}
                    <div className="w-full md:w-1/4 border-r dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-900/50">
                        <div className="p-3 border-b dark:border-gray-700 bg-white dark:bg-gray-800 font-bold text-gray-800 dark:text-white sticky top-0 z-10">
                            1. Select State
                            <input
                                type="text"
                                placeholder="Search State..."
                                className="w-full mt-2 p-2 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
                                value={stateSearchTerm}
                                onChange={(e) => setStateSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            {filteredStates.map(state => {
                                const allowed = isStateAllowed(state);
                                return (
                                    <div
                                        key={state}
                                        onClick={() => { setActiveState(state); setActiveCity(null); }}
                                        className={`p-3 border-b dark:border-gray-700 cursor-pointer flex items-center justify-between transition-colors
                                            ${activeState === state ? 'bg-white dark:bg-gray-800 border-l-4 border-l-primary shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                                        `}
                                    >
                                        <span className={`text-sm ${allowed ? 'font-semibold text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {state}
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={allowed}
                                            onClick={(e) => toggleState(state, allowed, e)}
                                            onChange={() => { }}
                                            className="w-5 h-5 cursor-pointer accent-primary ml-2 rounded border-gray-300"
                                        />
                                    </div>
                                );
                            })}
                            {filteredStates.length === 0 && <div className="p-4 text-center text-xs text-gray-400">No states found</div>}
                        </div>
                    </div>

                    {/* 2. Cities List */}
                    <div className="w-full md:w-1/4 border-r dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
                        <div className="p-3 border-b dark:border-gray-700 bg-white dark:bg-gray-800 font-bold text-gray-800 dark:text-white sticky top-0 z-10">
                            2. Select City
                            <input
                                type="text"
                                placeholder={activeState ? `Search in ${activeState}...` : "Select State first"}
                                className="w-full mt-2 p-2 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
                                value={citySearchTerm}
                                onChange={(e) => setCitySearchTerm(e.target.value)}
                                disabled={!activeState}
                            />
                        </div>
                        <div className="flex-grow overflow-y-auto relative">
                            {!activeState ? (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                                    &larr; Choose a State first
                                </div>
                            ) : filteredCities.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">No cities found</div>
                            ) : (
                                filteredCities.map(city => {
                                    const allowed = isCityAllowed(city, activeState);
                                    const implicit = isCityImplicitlyAllowed(city, activeState);
                                    return (
                                        <div
                                            key={city}
                                            onClick={() => setActiveCity(city)}
                                            className={`p-3 border-b dark:border-gray-700 cursor-pointer flex items-center justify-between gap-2
                                                ${activeCity === city ? 'bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                                            `}
                                        >
                                            <div className="flex flex-col">
                                                <span className={`text-sm ${allowed ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                                    {city}
                                                </span>
                                                {implicit && <span className="text-[10px] text-green-600">Enabled via State</span>}
                                            </div>

                                            <input
                                                type="checkbox"
                                                checked={allowed}
                                                onClick={(e) => toggleCity(city, activeState, allowed, e)}
                                                onChange={() => { }}
                                                className={`w-4 h-4 cursor-pointer rounded border-gray-300 accent-primary ${implicit ? 'opacity-60' : ''}`}
                                            />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* 3. Pincodes Info */}
                    <div className="w-full md:w-1/2 flex flex-col bg-gray-50 dark:bg-gray-900/50">
                        <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 font-bold text-gray-800 dark:text-white sticky top-0 z-10">
                            3. Serviceable Pincodes
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 relative">
                            {!activeCity ? (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                                    &larr; Select a City to view Pincodes
                                </div>
                            ) : (
                                <div className="h-full flex flex-col">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                                            {activeCity} <span className="text-gray-400 text-sm font-normal">({activeState})</span>
                                        </h3>
                                        {isCityAllowed(activeCity, activeState!) ? (
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                                Serviceable
                                            </span>
                                        ) : (
                                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                                Not Serviceable
                                            </span>
                                        )}
                                    </div>

                                    {isCityAllowed(activeCity, activeState!) ? (
                                        isLoadingPincodes ? (
                                            <div className="text-center py-10 text-gray-500">Loading Pincodes...</div>
                                        ) : pincodesInCity.length > 0 ? (
                                            <>
                                                <p className="text-xs text-gray-500 mb-2">Including all pincodes mapped to {activeCity}</p>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                                    {pincodesInCity.map(pin => (
                                                        <div key={pin} className="bg-white dark:bg-gray-800 border p-2 rounded text-center text-sm font-mono text-gray-600 shadow-sm">
                                                            {pin}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-10 text-gray-500 bg-white rounded border border-dashed">
                                                No pincodes found in database for this city.
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex-grow flex flex-col items-center justify-center text-gray-400 opacity-60">
                                            <div className="text-4xl mb-2">🚫</div>
                                            <p>Delivery disabled for this city.</p>
                                            <p className="text-xs">Enable the city or state to service these pincodes.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default DeliverySettingsPage;
