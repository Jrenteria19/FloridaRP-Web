document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchArticles');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Array con todos los artículos del código penal
    const articles = [
        // INFRACCIONES DE TRÁNSITO
        { category: 'transito', id: '1.1', description: 'Exceso de velocidad', sanction: '💰 $150.000 | ✅ Se quita licencia' },
        { category: 'transito', id: '1.2', description: 'Conducción temeraria', sanction: '💰 $250.000 | 🕑 2 meses | ✅ Se quita licencia | ✅ Se confisca vehículo' },
        { category: 'transito', id: '1.3', description: 'Circular en sentido contrario', sanction: '💰 $200.000 | 🕑 1 mes | ✅ Se quita licencia' },
        { category: 'transito', id: '1.4', description: 'Saltarse semáforo en rojo', sanction: '💰 $180.000' },
        { category: 'transito', id: '1.5', description: 'No respetar señalizaciones', sanction: '💰 $120.000' },
        { category: 'transito', id: '1.6', description: 'Obstruir paso de emergencia', sanction: '💰 $500.000 | 🕑 3 meses | ✅ Se quita licencia' },
        { category: 'transito', id: '1.7', description: 'Huir de control policial', sanction: '💰 $400.000 | 🕑 5 meses | ✅ Se quita licencia | ✅ Se confisca vehículo' },
        { category: 'transito', id: '1.8', description: 'Conducir sin licencia', sanction: '💰 $250.000 | ✅ Se quita licencia' },
        { category: 'transito', id: '1.9', description: 'Manejar en estado de ebriedad', sanction: '💰 $600.000 | 🕑 8 meses | ✅ Se quita licencia | ✅ Se confisca vehículo' },

        // INFRACCIONES VEHICULARES
        { category: 'vehicular', id: '2.1', description: 'Vehículo sin matrícula o tapada', sanction: '💰 $180.000 | ✅ Se confisca vehículo' },
        { category: 'vehicular', id: '2.2', description: 'Vehículo en mal estado o sin luces', sanction: '💰 $100.000' },
        { category: 'vehicular', id: '2.3', description: 'Estacionar en zona prohibida', sanction: '💰 $90.000' },
        { category: 'vehicular', id: '2.4', description: 'Uso indebido de sirenas policiales', sanction: '💰 $450.000 | 🕑 6 meses | ✅ Se quita licencia | ✅ Se confisca vehículo' },
        { category: 'vehicular', id: '2.5', description: 'Participar en carreras clandestinas', sanction: '💰 $750.000 | 🕑 1 año | ✅ Se quita licencia | ✅ Se confisca vehículo' },

        // DELITOS VEHICULARES
        { category: 'delitos-vehiculares', id: '3.1', description: 'Robo de vehículo', sanction: '💰 $1.500.000 | 🕑 2 años | ✅ Se quita licencia | ✅ Se confisca vehículo' },
        { category: 'delitos-vehiculares', id: '3.2', description: 'Robo con violencia de vehículo', sanction: '💰 $2.500.000 | 🕑 4 años | ✅ Se quita licencia | ✅ Se confisca vehículo' },
        { category: 'delitos-vehiculares', id: '3.3', description: 'Atropello con fuga', sanction: '💰 $3.000.000 | 🕑 5 años | ✅ Se quita licencia | ✅ Se confisca vehículo' },
        { category: 'delitos-vehiculares', id: '3.4', description: 'Transporte de drogas en vehículo', sanction: '💰 $2.000.000 | 🕑 3 años | ✅ Se quita licencia | ✅ Se confisca vehículo' },

        // DELITOS CON ARMAS
        { category: 'armas', id: '4.1', description: 'Porte ilegal de arma blanca', sanction: '💰 $500.000 | 🕑 1 año | ✅ Se quita licencia' },
        { category: 'armas', id: '4.2', description: 'Porte ilegal de arma de fuego', sanction: '💰 $1.000.000 | 🕑 3 años | ✅ Se quita licencia' },
        { category: 'armas', id: '4.3', description: 'Disparar en la vía pública', sanction: '💰 $1.500.000 | 🕑 5 años | ✅ Se quita licencia' },
        { category: 'armas', id: '4.4', description: 'Uso de arma en delito', sanction: '💰 $3.000.000 | 🕑 7 años | ✅ Se quita licencia' },

        // DELITOS CONTRA LA PROPIEDAD
        { category: 'propiedad', id: '5.1', description: 'Robo a local comercial', sanction: '💰 $1.000.000 | 🕑 3 años' },
        { category: 'propiedad', id: '5.2', description: 'Robo a vivienda', sanction: '💰 $2.500.000 | 🕑 5 años' },
        { category: 'propiedad', id: '5.3', description: 'Robo con violencia', sanction: '💰 $3.500.000 | 🕑 7 años' },

        // DELITOS CONTRA LA AUTORIDAD
        { category: 'autoridad', id: '6.1', description: 'Agresión a funcionario público', sanction: '💰 $1.000.000 | 🕑 3 años' },
        { category: 'autoridad', id: '6.2', description: 'Insultar a un oficial en servicio', sanction: '💰 $500.000' },
        { category: 'autoridad', id: '6.3', description: 'Resistirse al arresto', sanction: '💰 $750.000 | 🕑 1 año' },

        // DELITOS GRAVES
        { category: 'graves', id: '7.1', description: 'Secuestro', sanction: '💰 $4.000.000 | 🕑 10 años' },
        { category: 'graves', id: '7.2', description: 'Homicidio simple', sanction: '💰 $5.000.000 | 🕑 15 años' },
        { category: 'graves', id: '7.3', description: 'Homicidio de funcionario', sanction: '🚨 Cadena Perpetua' }
    ];

    function renderArticles(filteredArticles) {
        const container = document.querySelector('.articles-table');
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Artículo</th>
                        <th>Descripción</th>
                        <th>Sanción</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredArticles.map(article => `
                        <tr>
                            <td>${article.id}</td>
                            <td>${article.description}</td>
                            <td>${article.sanction}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Buscador
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = articles.filter(article => 
            article.description.toLowerCase().includes(searchTerm) ||
            article.id.toLowerCase().includes(searchTerm)
        );
        renderArticles(filtered);
    });

    // Filtros por categoría
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const category = button.dataset.category;
            const filtered = category === 'all' 
                ? articles 
                : articles.filter(article => article.category === category);
            
            renderArticles(filtered);
        });
    });

    // Renderizar todos los artículos inicialmente
    renderArticles(articles);
});