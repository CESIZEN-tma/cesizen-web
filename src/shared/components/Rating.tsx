import React from 'react';
import { MdStar, MdStarBorder } from 'react-icons/md';
import Icon from '../../shared/components/Icon';
import './styles/rating.css';

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readonly?: boolean;
  size?: number;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  max = 5,
  readonly = false,
  size = 24,
}) => {
  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className={`rating ${readonly ? 'rating-readonly' : ''}`}>
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= value;

        return (
          <button
            key={index}
            type="button"
            className={`rating-star ${isFilled ? 'filled' : ''}`}
            onClick={() => handleClick(starValue)}
            disabled={readonly}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Icon icon={isFilled ? MdStar : MdStarBorder} size={size} />
          </button>
        );
      })}
    </div>
  );
};
