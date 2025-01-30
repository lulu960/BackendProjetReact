import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';

function Home() {
    const [profiles, setProfiles] = useState([]);
  
    useEffect(() => {
      const fetchProfiles = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:3000/api/match/users/swipe', {
            headers: { Authorization: `${token}` }
          });
          setProfiles(response.data);
        } catch (error) {
          console.error('Erreur lors du chargement des profils', error);
        }
      };
  
      fetchProfiles();
    }, []);
  
    return (
      <div className="home-container">
        <h2>Swipe des Profils</h2>
        <div className="profiles">
          {profiles.length > 0 ? (
            profiles.map((user) => (
              <div key={user._id} className="profile-card">
                <h3>{user.name}, {user.age}</h3>
                <p>{user.location}</p>
              </div>
            ))
          ) : (
            <p>Aucun profil à afficher</p>
          )}
        </div>
      </div>
    );
  }
  
  export default Home;
  