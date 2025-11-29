import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function GeofenceManager() {
    const [geofences, setGeofences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newGeofence, setNewGeofence] = useState({
        name: '',
        coordinates: '', // Text input for now: [[lng, lat], ...]
        notifyOnEntry: true
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGeofences();
    }, []);

    const fetchGeofences = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dashboard/geofences');
            setGeofences(response.data || []);
        } catch (err) {
            console.error('Failed to fetch geofences:', err);
            setError('Failed to load geofences');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this geofence?')) return;
        try {
            await api.delete(`/dashboard/geofences/${id}`);
            fetchGeofences();
        } catch (err) {
            console.error('Failed to delete geofence:', err);
            alert('Failed to delete geofence');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            let parsedCoords;
            try {
                parsedCoords = JSON.parse(newGeofence.coordinates);
                if (!Array.isArray(parsedCoords)) throw new Error('Must be an array');
            } catch (err) {
                setError('Invalid coordinates format. Use JSON array of points: [[lng, lat], [lng, lat], ...]');
                return;
            }

            // Ensure it's a closed polygon (first and last point match)
            if (parsedCoords.length > 0) {
                const first = parsedCoords[0];
                const last = parsedCoords[parsedCoords.length - 1];
                if (first[0] !== last[0] || first[1] !== last[1]) {
                    parsedCoords.push(first);
                }
            }

            await api.post('/dashboard/geofences', {
                name: newGeofence.name,
                polygon: { coordinates: [parsedCoords] }, // GeoJSON Polygon format expects array of rings
                notifyOnEntry: newGeofence.notifyOnEntry
            });

            setNewGeofence({ name: '', coordinates: '', notifyOnEntry: true });
            fetchGeofences();
        } catch (err) {
            console.error('Failed to create geofence:', err);
            setError(err.response?.data?.error || 'Failed to create geofence');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Geofence Management</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Create Form */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 6px 20px rgba(2,6,23,0.06)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Create New Geofence</h2>
                    {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Name</label>
                            <input
                                type="text"
                                value={newGeofence.name}
                                onChange={(e) => setNewGeofence({ ...newGeofence, name: e.target.value })}
                                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                                Coordinates (JSON Array of [lng, lat])
                            </label>
                            <textarea
                                value={newGeofence.coordinates}
                                onChange={(e) => setNewGeofence({ ...newGeofence, coordinates: e.target.value })}
                                placeholder="[[77.5, 12.9], [77.6, 12.9], [77.6, 13.0], [77.5, 13.0]]"
                                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', height: '100px', fontFamily: 'monospace' }}
                                required
                            />
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                Enter points as [longitude, latitude]. The polygon will be automatically closed.
                            </div>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <input
                                    type="checkbox"
                                    checked={newGeofence.notifyOnEntry}
                                    onChange={(e) => setNewGeofence({ ...newGeofence, notifyOnEntry: e.target.checked })}
                                />
                                Escalate Priority & Notify on Entry
                            </label>
                        </div>
                        <button
                            type="submit"
                            style={{
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Create Geofence
                        </button>
                    </form>
                </div>

                {/* List */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 6px 20px rgba(2,6,23,0.06)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Active Geofences</h2>
                    {loading ? (
                        <div>Loading...</div>
                    ) : geofences.length === 0 ? (
                        <div style={{ color: '#64748b' }}>No geofences created yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {geofences.map(geo => (
                                <div key={geo._id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{geo.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                Created by: {geo.createdBy?.name || 'Unknown'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                Points: {geo.polygon?.coordinates[0]?.length || 0}
                                            </div>
                                            {geo.notifyOnEntry && (
                                                <span style={{
                                                    display: 'inline-block',
                                                    background: '#fee2e2',
                                                    color: '#dc2626',
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    marginTop: '4px'
                                                }}>
                                                    Escalation Active
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(geo._id)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                fontSize: '18px'
                                            }}
                                            title="Delete Geofence"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
