import React from 'react';
import './ImageCarousel.css';

const images = [
  require('../assets/images/images.jpeg'),
  require('../assets/images/vision1.jpeg'),
  require('../assets/images/vision2.jpeg'),
  require('../assets/images/vision3.jpeg'),
  require('../assets/images/vision4.jpeg'),
  require('../assets/images/vision5.jpeg'),

];

export default function ImageCarousel() {
  return (
    <div className="carousel-wrapper">
      <div className="carousel-track">
        {images.concat(images).map((src, idx) => (
          <img
            src={src}
            key={idx}
            className="carousel-image"
            alt={`slide ${idx % images.length + 1}`}
            draggable="false"
          />
        ))}
      </div>
    </div>
  );
}
