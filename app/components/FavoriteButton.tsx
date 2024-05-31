import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface FavoriteButtonProps {
  id: string;
  is_favorite: boolean;
  markFavorite: (id: string, is_favorite: boolean) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ id, is_favorite, markFavorite }) => {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Evita que el clic se propague al contenedor de la tarjeta
    markFavorite(id, !is_favorite);
  };

  return (
    <button onClick={handleClick} className="absolute top-2 right-2 text-red-500">
      {is_favorite ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
    </button>
  );
};

export default FavoriteButton;
