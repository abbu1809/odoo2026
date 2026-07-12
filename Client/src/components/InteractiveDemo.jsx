import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, RotateCcw, CheckCircle, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const InteractiveDemo = ({ activeTab, setActiveTab }) => {
  const {
    vehicles,
    drivers,
    trips,
    maintenanceLogs,
    addVehicle,
    addDriver,
    createTrip,
    dispatchTrip,
    completeTrip,
    addMaintenanceLog,
    resetDatabase,
    deleteVehicle,
    deleteDriver,
    showToast
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [createdTripId, setCreatedTripId] = useState(null);

  const steps = [
    {
      step: 1,
      title: "Register Vehicle 'Van-05'",
      desc: "Register a new vehicle named 'Van-05' with a maximum capacity of 500 kg in Available status.",
      actionLabel: "Register Van-05",
      run: () => {
        // Clean up if already exists to ensure success
        if (vehicles.some(v => v.registrationNumber === 'Van-05')) {
          deleteVehicle('Van-05');
        }
        const success = addVehicle({
          registrationNumber: 'Van-05',
          name: 'Ford Transit Van-05',
          type: 'Van',
          maxCapacity: 500,
          odometer: 25000,
          acquisitionCost: 30000,
          status: 'Available',
          region: 'North'
        });
        if (success) {
          setActiveTab('vehicles');
          confetti({ particleCount: 50, spread: 60, colors: ['#CF4500', '#F79E1B', '#141413'] });
        }
        return success;
      }
    },
    {
      step: 2,
      title: "Register Driver 'Alex'",
      desc: "Register driver 'Alex' with a valid driving license (expiring in 2028). Status starts as Available.",
      actionLabel: "Register Alex",
      run: () => {
        // Clean up if already exists to ensure success
        if (drivers.some(d => d.name === 'Alex')) {
          deleteDriver('Alex');
        }
        const success = addDriver({
          name: 'Alex',
          licenseNumber: 'DL-AX505',
          licenseCategory: 'Class B',
          licenseExpiryDate: '2028-12-15',
          contactNumber: '+1-555-0105',
          safetyScore: 98,
          status: 'Available'
        });
        if (success) {
          setActiveTab('drivers');
          confetti({ particleCount: 50, spread: 60, colors: ['#CF4500', '#F79E1B', '#141413'] });
        }
        return success;
      }
    },
    {
      step: 3,
      title: "Create Trip (Cargo: 450 kg)",
      desc: "Create a dispatch draft with Cargo Weight = 450 kg, assigning Van-05 and Alex.",
      actionLabel: "Create Trip Draft",
      run: () => {
        // Double check assets are there
        const van = vehicles.find(v => v.registrationNumber === 'Van-05');
        const alex = drivers.find(d => d.name === 'Alex');
        if (!van || !alex) {
          showToast("Please ensure Step 1 & 2 are completed first!", "error");
          return false;
        }

        const success = createTrip({
          source: 'Chicago Hub A',
          destination: 'Milwaukee Depot B',
          vehicleId: 'Van-05',
          driverName: 'Alex',
          cargoWeight: 450,
          distance: 300,
          revenue: 1800,
          date: '2026-07-12'
        });

        if (success) {
          // Find the created trip to store ID
          setTimeout(() => {
            // Context puts latest trip at index 0
            const latest = localStorage.getItem('transitops_trips');
            if (latest) {
              const loadedTrips = JSON.parse(latest);
              const targetTrip = loadedTrips.find(t => t.vehicleId === 'Van-05' && t.status === 'Draft');
              if (targetTrip) {
                setCreatedTripId(targetTrip.id);
              }
            }
          }, 100);
          setActiveTab('trips');
        }
        return success;
      }
    },
    {
      step: 4,
      title: "Verify Cargo Weight",
      desc: "System validates that 450 kg ≤ 500 kg (Van-05 capacity). Displays validation check success.",
      actionLabel: "Check & Approve Dispatch",
      run: () => {
        showToast("Validation check passed: Cargo 450kg is within Van-05 capacity (500kg).", "success");
        return true;
      }
    },
    {
      step: 5,
      title: "Dispatch Trip",
      desc: "Dispatching the trip automatically changes Van-05 and Alex status to 'On Trip'.",
      actionLabel: "Dispatch Cargo",
      run: () => {
        // Find latest trip for Van-05 in Draft
        const activeTrip = trips.find(t => t.vehicleId === 'Van-05' && t.status === 'Draft');
        const targetId = activeTrip ? activeTrip.id : createdTripId;
        
        if (!targetId) {
          showToast("Active Draft trip for Van-05 not found! Re-run Step 3.", "error");
          return false;
        }

        const success = dispatchTrip(targetId);
        if (success) {
          setActiveTab('trips');
        }
        return success;
      }
    },
    {
      step: 6,
      title: "Complete Trip & Log Fuel",
      desc: "Complete trip: Enter final odometer (25,300 km) and fuel consumed (24L, costing $48).",
      actionLabel: "Complete & Refuel",
      run: () => {
        const activeTrip = trips.find(t => t.vehicleId === 'Van-05' && t.status === 'Dispatched');
        const targetId = activeTrip ? activeTrip.id : createdTripId;

        if (!targetId) {
          showToast("Dispatched trip for Van-05 not found! Re-run Step 5.", "error");
          return false;
        }

        const success = completeTrip(targetId, {
          finalOdometer: 25300,
          fuelConsumed: 24,
          fuelCost: 48,
          revenueValue: 1800
        });

        if (success) {
          confetti({ particleCount: 80, spread: 80, colors: ['#4CAF50', '#CF4500', '#141413'] });
          setActiveTab('trips');
        }
        return success;
      }
    },
    {
      step: 7,
      title: "Verify Assets Returned Available",
      desc: "Check that both Van-05 and Alex status automatically changed back to 'Available'.",
      actionLabel: "Check Availability Status",
      run: () => {
        const van = vehicles.find(v => v.registrationNumber === 'Van-05');
        const alex = drivers.find(d => d.name === 'Alex');
        if (van?.status === 'Available' && alex?.status === 'Available') {
          showToast("Verification Success: Van-05 and Alex are back to Available!", "success");
          return true;
        } else {
          showToast(`Wait: Van-05 is ${van?.status}, Alex is ${alex?.status}`, "error");
          return false;
        }
      }
    },
    {
      step: 8,
      title: "Log Vehicle Maintenance",
      desc: "Create active maintenance record (Oil Change). Status automatically switches to 'In Shop'.",
      actionLabel: "Add Maintenance (Oil Change)",
      run: () => {
        const success = addMaintenanceLog({
          vehicleId: 'Van-05',
          type: 'Oil Change & Filter',
          cost: 120,
          date: '2026-07-12',
          description: 'Standard mileage engine service.',
          status: 'Active'
        });
        if (success) {
          setActiveTab('maintenance');
        }
        return success;
      }
    },
    {
      step: 9,
      title: "Verify Reports Recalculated",
      desc: "Reports dynamically update operational cost ($168), efficiency (12.5 km/L), and ROI (5.44%).",
      actionLabel: "View Performance Analytics",
      run: () => {
        setActiveTab('reports');
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { y: 0.6 }
        });
        return true;
      }
    }
  ];

  const handleRunStep = () => {
    const stepObj = steps.find(s => s.step === currentStep);
    if (!stepObj) return;

    const result = stepObj.run();
    if (result) {
      setCompletedSteps(prev => [...prev, currentStep]);
      if (currentStep < 9) {
        setCurrentStep(prev => prev + 1);
      } else {
        showToast("Hackathon Workflow Completed Successfully!", "success");
      }
    }
  };

  const handleReset = () => {
    resetDatabase();
    setCompletedSteps([]);
    setCurrentStep(1);
    setCreatedTripId(null);
    setActiveTab('dashboard');
  };

  return (
    <div 
      className="interactive-demo-panel no-print" 
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 1001,
        fontFamily: 'var(--font-primary)'
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--ink-black)',
          color: 'var(--canvas-cream)',
          border: 'none',
          boxShadow: 'var(--shadow-card)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? <ChevronLeft size={24} /> : <HelpCircle size={24} />}
      </button>

      {/* Main Panel Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '72px',
            left: 0,
            width: '380px',
            backgroundColor: 'var(--white)',
            boxShadow: 'var(--shadow-hover)',
            borderRadius: '24px',
            border: '1px solid rgba(0,0,0,0.08)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div className="flex-between" style={{ borderBottom: '1px solid var(--canvas-cream)', paddingBottom: '12px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Demo Wizard</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Hackathon Test Flow</h3>
            </div>
            <button
              onClick={handleReset}
              className="flex-center"
              title="Reset Database"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--slate-gray)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--soft-bone)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Steps Progress Indicator */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '8px' }}>
            {steps.map(s => {
              const isComp = completedSteps.includes(s.step);
              const isAct = currentStep === s.step;
              return (
                <div
                  key={s.step}
                  onClick={() => {
                    // Allow navigating to previously completed steps or next logical step
                    if (isComp || s.step === currentStep || completedSteps.includes(s.step - 1)) {
                      setCurrentStep(s.step);
                    }
                  }}
                  style={{
                    flex: '1 0 auto',
                    textAlign: 'center',
                    padding: '6px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 750,
                    cursor: 'pointer',
                    backgroundColor: isAct ? 'var(--ink-black)' : isComp ? '#E2F4E6' : 'var(--soft-bone)',
                    color: isAct ? 'var(--canvas-cream)' : isComp ? '#1D6930' : 'var(--slate-gray)',
                    transition: 'all 0.2s'
                  }}
                >
                  Step {s.step}
                </div>
              );
            })}
          </div>

          {/* Active Step Panel */}
          {steps.map(s => {
            if (s.step !== currentStep) return null;
            const isCompleted = completedSteps.includes(s.step);
            return (
              <div 
                key={s.step}
                className="card-raised"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderLeft: isCompleted ? '4px solid #4CAF50' : '4px solid var(--light-signal-orange)'
                }}
              >
                <div className="flex-between">
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-gray)', textTransform: 'uppercase' }}>
                    Active Operation
                  </span>
                  {isCompleted && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1D6930', fontSize: '0.75rem', fontWeight: 700 }}>
                      <CheckCircle size={14} /> Completed
                    </span>
                  )}
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{s.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-gray)' }}>{s.desc}</p>
                
                <button
                  onClick={handleRunStep}
                  className="btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    alignSelf: 'flex-start',
                    backgroundColor: isCompleted ? '#262627' : 'var(--ink-black)'
                  }}
                >
                  <Play size={12} fill="currentColor" /> {s.actionLabel}
                </button>
              </div>
            );
          })}

          {/* Guidelines */}
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-gray)', lineHeight: '1.3' }}>
            <span style={{ fontWeight: 700 }}>Instructions:</span> Click the button above to run the script. It automatically triggers validations and navigates to the relevant panel to show live data mutations.
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveDemo;
