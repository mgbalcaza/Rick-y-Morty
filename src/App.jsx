import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import './style.scss';

function App() {
  const [characters, setCharacters] = useState([]); // Personajes cargados
  const [filteredCharacters, setFilteredCharacters] = useState([]); // Personajes filtrados
  const [selectedCharacter, setSelectedCharacter] = useState(null); // Personaje seleccionado
  const [showModal, setShowModal] = useState(false); // Control del modal
  const [currentStartId, setCurrentStartId] = useState(1); // ID inicial para el próximo lote de personajes
  const [filter, setFilter] = useState('All'); // Estado del filtro

  const ITEMS_POR_LOAD = 8;

  // Función para obtener personajes por ID
  const fetchCharactersByIds = (startId) => {
    const endId = startId + ITEMS_POR_LOAD - 1;
    const ids = Array.from({ length: ITEMS_POR_LOAD }, (_, i) => startId + i);
    const url = `https://rickandmortyapi.com/api/character/${ids.join(',')}`;
    
    axios.get(url)
      .then(response => {
        const newCharacters = response.data.filter((newChar) =>
          !characters.some((existingChar) => existingChar.id === newChar.id)
        );
        setCharacters(prevCharacters => [...prevCharacters, ...newCharacters]);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  // Obtener los primeros 8 personajes al cargar
  useEffect(() => {
    if (characters.length === 0) {
      fetchCharactersByIds(currentStartId);
    }
  }, []);

  // Filtrar personajes según el filtro seleccionado
  useEffect(() => {
    if (filter === 'All') {
      setFilteredCharacters(characters);
    } else {
      setFilteredCharacters(characters.filter(character => character.status === filter));
    }
  }, [characters, filter]);

  // Manejar clic en un personaje
  const clickHandle = (id) => {
    axios.get(`https://rickandmortyapi.com/api/character/${id}`)
      .then(res => {
        setSelectedCharacter(res.data);
        setShowModal(true);
      })
      .catch(err => {
        console.log(err);
      });
  };

  // Cargar más personajes
  const loadMore = () => {
    const nextStartId = currentStartId + ITEMS_POR_LOAD;
    fetchCharactersByIds(nextStartId);
    setCurrentStartId(nextStartId);
  };

  // Cerrar el modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Manejar el cambio del filtro
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  return (
    <div className="container">
      <h1 className="my-4">Rick & Morty</h1>

      {/* Filtro por estado */}
      <div className="my-4">
        <label htmlFor="statusFilter">Estado: </label>
        <select id="statusFilter" className="form-select w-auto d-inline" value={filter} onChange={handleFilterChange}>
          <option value="All">All</option>
          <option value="Alive">Alive</option>
          <option value="Dead">Dead</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      <div className="row">
        {filteredCharacters.map(character => (
          <div 
            key={character.id} 
            className="col-lg-2 col-md-4 col-sm-12 mb-4"
          >
            <button 
              onClick={() => clickHandle(character.id)} 
              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <img src={character.image} alt={character.name} className="img-fluid" />
              <h2 className="h5">{character.name}</h2>
              <p>Status: {character.status}</p>
            </button>
          </div>
        ))}
      </div>

      {/* Botón de "Load More" */}
      <Button onClick={loadMore} variant="primary" className="my-4">
        Load More
      </Button>

      {/* Modal para mostrar la información del personaje */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedCharacter?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCharacter && (
            <div className="text-center">
              <img src={selectedCharacter.image} alt={selectedCharacter.name} className="img-fluid mb-4" style={{ width: '150px' }} />
              <p><strong>Especie:</strong> {selectedCharacter.species}</p>
              <p><strong>Status:</strong> {selectedCharacter.status}</p>
              <p><strong>Género:</strong> {selectedCharacter.gender}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
