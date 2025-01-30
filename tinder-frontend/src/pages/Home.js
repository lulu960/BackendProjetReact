import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';

function Home() {
    const [profiles, setProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
  
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
  
    const handleLike = async () => {
      if (profiles.length > 0 && currentIndex < profiles.length) {
        const userId = profiles[currentIndex]._id;
        try {
          const token = localStorage.getItem('token');
          await axios.post(`http://localhost:3000/api/match/like/${userId}`, {}, {
            headers: { Authorization: `${token}` }
          });
        } catch (error) {
          console.error('Erreur lors du like', error);
        }
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }
    };
  
    const handlePass = () => {
      if (profiles.length > 0) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }
    };
  
    return (
      <div className="home-container">
        <h2>Swipe des Profils</h2>
        <div className="profile-card">
          {profiles.length > 0 && currentIndex < profiles.length ? (
            <div>
              <h3>{profiles[currentIndex].name}, {profiles[currentIndex].age}</h3>
              <p>{profiles[currentIndex].location}</p>
              <button onClick={handleLike}>Like</button>
              <button onClick={handlePass}>Pass</button>
            </div>
          ) : (
            <p>Aucun profil à afficher</p>
          )}
        </div>
      </div>
    );
  }
  
  export default Home;