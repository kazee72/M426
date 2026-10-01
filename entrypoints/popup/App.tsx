import { useState } from 'react';

function App() {
  // Sleep-Toggle
  const [isSleeping, setIsSleeping] = useState(false);


  const handleWater = () => {
    console.log('Action: give water');
    // TODO 
  };

  const handleFood = () => {
    console.log('Action: give food');
    // TODO
  };


  const handleHappiness = () => {
    console.log('Action: played with pokemon');
    // TODO 
  };


  const handleClean = () => {
    console.log('Action: cleaned');
    // TODO
  };

  const toggleSleep = () => {
    setIsSleeping((prevState) => {
      const newState = !prevState; 
      
      if (newState) {
        console.log('Action: start sleep');
        // TODO: start intervall that filles sleep
      } else {
        console.log('Action: stop sleep');
        // TODO: stop intervall
      }
      
      return newState;
    });
  };


  const containerStyle: React.CSSProperties = {
    padding: '20px',
    minWidth: '250px',
    textAlign: 'center',
    backgroundColor: isSleeping ? '#2c3e50' : '#ffffff',
    color: isSleeping ? '#ffffff' : '#000000',
    transition: 'background-color 0.5s ease',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px',
  };

  return (
    <div style={containerStyle}>
      <h2>Mein Pokémon {isSleeping ? '💤' : '😊'}</h2>
      
      <div style={buttonContainerStyle}>
        {/* the first 3 buttons are disabled when pokemon is sleeping*/}
        <button onClick={handleWater} disabled={isSleeping}>
          water
        </button>
        <button onClick={handleFood} disabled={isSleeping}>
          food
        </button>
        <button onClick={handleHappiness} disabled={isSleeping}>
          play
        </button>
        
        <button onClick={handleClean}>
          clean
        </button>
        
        <button onClick={toggleSleep}>
          {isSleeping ? 'wake up' : 'go to sleep'}
        </button>
      </div>
    </div>
  );
}

export default App;