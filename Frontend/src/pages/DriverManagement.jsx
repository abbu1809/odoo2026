import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Search, X, Check, ShieldAlert, Phone, Shield } from 'lucide-react';

const DriverManagement = () => {
  const {
    drivers,
    addDriver,
    updateDriver,
    deleteDriver,
    activeUserRole,
    checkIsLicenseExpired,
    checkIsLicenseExpiringSoon
  } = useApp();

  const isManager = activeUserRole === 'Fleet Manager';
  const isSafetyOfficer = activeUserRole === 'Safety Officer';
  const hasWriteAccess = isManager || isSafetyOfficer;

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [complianceFilter, setComplianceFilter] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [licenseNum, setLicenseNum] = useState('');
  const [category, setCategory] = useState('Class A');
  const [expiryDate, setExpiryDate] = useState('');
  const [contact, setContact] = useState('');
  const [safetyScore, setSafetyScore] = useState('');
  const [status, setStatus] = useState('Available');

  const handleOpenAdd = () => {
    if (!isManager) return; // Only managers can register new drivers
    setEditingDriver(null);
    setName('');
    setLicenseNum('');
    setCategory('Class A');
    setExpiryDate('');
    setContact('');
    setSafetyScore(100);
    setStatus('Available');
    setModalOpen(true);
  };

  const handleOpenEdit = (driver) => {
    if (!hasWriteAccess) return;
    setEditingDriver(driver);
    setName(driver.name);
    setLicenseNum(driver.licenseNumber);
    setCategory(driver.licenseCategory);
    setExpiryDate(driver.licenseExpiryDate);
    setContact(driver.contactNumber);
    setSafetyScore(driver.safetyScore);
    setStatus(driver.status);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !licenseNum.trim()) return;

    const driverData = {
      name: name.trim(),
      licenseNumber: licenseNum.trim(),
      licenseCategory: category,
      licenseExpiryDate: expiryDate,
      contactNumber: contact.trim(),
      safetyScore: Number(safetyScore) || 0,
      status
    };

    if (editingDriver) {
      const success = updateDriver(editingDriver.name, driverData);
      if (success) setModalOpen(false);
    } else {
      const success = addDriver(driverData);
      if (success) setModalOpen(false);
    }
  };

  const handleDelete = (driverName) => {
    if (!isManager) return;
    if (window.confirm(`Are you sure you want to remove driver ${driverName} from roster?`)) {
      deleteDriver(driverName);
    }
  };

  // Filter Drivers
  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    
    // Compliance status filter
    const isExpired = checkIsLicenseExpired(d.licenseExpiryDate);
    const isExpiringSoon = checkIsLicenseExpiringSoon(d.licenseExpiryDate);
    
    let matchesCompliance = true;
    if (complianceFilter === 'Expired') {
      matchesCompliance = isExpired;
    } else if (complianceFilter === 'Expiring') {
      matchesCompliance = isExpiringSoon;
    } else if (complianceFilter === 'CriticalScore') {
      matchesCompliance = d.safetyScore < 75;
    }

    return matchesSearch && matchesStatus && matchesCompliance;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title Bar */}
      <div className="flex-between">
        <div>
          <span className="eyebrow" style={{ marginBottom: '8px' }}>• COMPLIANCE & SAFETY</span>
          <h2 style={{ fontWeight: 700 }}>Driver Management</h2>
        </div>

        {isManager ? (
          <button onClick={handleOpenAdd} className="btn-primary" style={{ gap: '6px' }}>
            <Plus size={16} /> Add Driver Profile
          </button>
        ) : isSafetyOfficer ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-gray)', fontSize: '0.85rem' }}>
            <Shield size={16} style={{ color: 'var(--light-signal-orange)' }} />
            <span>Safety Officer mode: You can edit scores and suspension status.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-gray)', fontSize: '0.85rem' }}>
            <AlertCircle icon size={16} />
            <span>Switch to <b>Fleet Manager</b> or <b>Safety Officer</b> to edit driver records.</span>
          </div>
        )}
      </div>

      {/* Filter and Search Panel */}
      <div className="card-raised" style={{ padding: '20px 24px', borderRadius: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', color: 'var(--slate-gray)' }} />
          <input 
            type="text" 
            placeholder="Search by driver name or license number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '48px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: '150px', padding: '10px 16px', borderRadius: '16px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </select>

          <select 
            value={complianceFilter} 
            onChange={(e) => setComplianceFilter(e.target.value)}
            className="form-select"
            style={{ width: '180px', padding: '10px 16px', borderRadius: '16px' }}
          >
            <option value="All">All Compliance</option>
            <option value="Expired">Expired License Only</option>
            <option value="Expiring">Expiring (30 Days)</option>
            <option value="CriticalScore">Critical Safety Score (&lt;75)</option>
          </select>
        </div>
      </div>

      {/* Drivers Profiles Grid */}
      <div className="grid-3">
        {filteredDrivers.length === 0 ? (
          <div className="card-elevated" style={{ gridColumn: 'span 3', padding: '60px 24px', textAlign: 'center', color: 'var(--slate-gray)' }}>
            <ShieldAlert size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <h3 style={{ marginBottom: '8px', fontSize: '1.2rem' }}>No drivers found</h3>
            <p>Modify search filters or register a new driver profile.</p>
          </div>
        ) : (
          filteredDrivers.map((driver) => {
            const isExpired = checkIsLicenseExpired(driver.licenseExpiryDate);
            const isExpiringSoon = checkIsLicenseExpiringSoon(driver.licenseExpiryDate);
            
            return (
              <div 
                key={driver.name} 
                className="card-elevated"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: isExpired ? '5px solid var(--signal-orange)' : 
                             isExpiringSoon ? '5px solid var(--light-signal-orange)' : 
                             driver.status === 'Suspended' ? '5px solid var(--signal-orange)' : '5px solid transparent'
                }}
              >
                <div>
                  {/* Card Header & Status */}
                  <div className="flex-between" style={{ marginBottom: '16px' }}>
                    <span className="eyebrow" style={{ fontSize: '0.75rem' }}>
                      {driver.licenseCategory}
                    </span>
                    <span className={`badge ${
                      driver.status === 'Available' ? 'badge-success' : 
                      driver.status === 'On Trip' ? 'badge-info' : 
                      driver.status === 'Suspended' ? 'badge-danger' : 'badge-neutral'
                    }`}>
                      {driver.status}
                    </span>
                  </div>

                  {/* Driver Info */}
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>{driver.name}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--slate-gray)', marginBottom: '16px' }}>
                    <span>License: <b>{driver.licenseNumber}</b></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Expires: {driver.licenseExpiryDate}
                      {isExpired && (
                        <span style={{ color: 'var(--signal-orange)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <ShieldAlert size={12} /> Expired!
                        </span>
                      )}
                      {isExpiringSoon && (
                        <span style={{ color: 'var(--light-signal-orange)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <ShieldAlert size={12} /> Expiring Soon
                        </span>
                      )}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={12} /> {driver.contactNumber}
                    </span>
                  </div>

                  {/* Safety Score Meter */}
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--canvas-cream)', paddingTop: '16px' }}>
                    <div className="flex-between" style={{ marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Safety Rating</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: driver.safetyScore > 85 ? '#1D6930' : driver.safetyScore > 70 ? 'var(--light-signal-orange)' : 'var(--signal-orange)' }}>
                        {driver.safetyScore} / 100
                      </span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--canvas-cream)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${driver.safetyScore}%`,
                        height: '100%',
                        backgroundColor: driver.safetyScore > 85 ? '#4CAF50' : driver.safetyScore > 70 ? 'var(--light-signal-orange)' : 'var(--signal-orange)',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Edit Actions */}
                {hasWriteAccess && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px', borderTop: '1px solid var(--canvas-cream)', paddingTop: '16px' }}>
                    <button
                      onClick={() => handleOpenEdit(driver)}
                      className="btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '14px', gap: '4px' }}
                    >
                      <Edit2 size={12} /> Edit Details
                    </button>
                    {isManager && (
                      <button
                        onClick={() => handleDelete(driver.name)}
                        className="btn-danger"
                        style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '14px', gap: '4px', backgroundColor: '#FCE8E6', color: '#C5221F', border: '1px solid #FCE8E6' }}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CRUD / Compliance Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex-between" style={{ marginBottom: '24px', borderBottom: '1px solid var(--canvas-cream)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {editingDriver ? `Edit Driver: ${editingDriver.name}` : 'Register New Driver'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-gray)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group">
                <label>Driver Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Alex Johnson" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!!editingDriver && !isManager} // Safety officer can't change name, only manager
                  className="form-input"
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>License Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. DL-12345" 
                    value={licenseNum}
                    onChange={(e) => setLicenseNum(e.target.value)}
                    disabled={!!editingDriver && !isManager}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>License Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={!!editingDriver && !isManager}
                    className="form-select"
                  >
                    <option value="Class A">Class A (Heavy Duty)</option>
                    <option value="Class B">Class B (Commercial Van)</option>
                    <option value="Class C">Class C (Sedan Support)</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>License Expiry Date</label>
                  <input 
                    type="date" 
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    disabled={!!editingDriver && !isManager}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. +1-555-0199" 
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    disabled={!!editingDriver && !isManager}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-2" style={{ borderTop: '1px solid var(--canvas-cream)', paddingTop: '16px' }}>
                <div className="form-group">
                  <label>Safety Score (0 - 100)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    max="100"
                    placeholder="e.g. 95" 
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    disabled={!hasWriteAccess}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={!hasWriteAccess}
                    className="form-select"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  {editingDriver ? 'Update Profile' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
