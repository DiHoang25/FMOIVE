import React from 'react';
import { Checkbox, Col, Row } from 'antd';

const genres = [
  'action', 'drama', 'romance', 'thriller',
  'comedy', 'horror', 'sciFi', 'animation'
];

const GernesPicker = ({ genres: selectedGenres = {}, onChange }) => {
  const handleCheckboxChange = (checkedValues) => {
    // Convert array ['action', 'drama'] to object { action: true, drama: true, ... }
    const updated = {};
    genres.forEach((g) => {
      updated[g] = checkedValues.includes(g);
    });

    onChange(updated);
  };

  return (
    <Checkbox.Group
      style={{ width: '100%' }}
      value={Object.keys(selectedGenres).filter((g) => selectedGenres[g])}
      onChange={handleCheckboxChange}
    >
      <Row>
        {genres.map((genre) => (
          <Col span={12} key={genre}>
            <Checkbox value={genre} style={{ color: 'white' }}>
              {genre.charAt(0).toUpperCase() + genre.slice(1)}
            </Checkbox>
          </Col>
        ))}
      </Row>
    </Checkbox.Group>
  );
};

export default GernesPicker;
