// import { useState } from 'react';
// const StarRating = ({ rating, setRating, readOnly = false, size = 24 }) => {
//   const [hover, setHover] = useState(null);
//   return (
//     <div style={{ display: 'flex', gap: 2 }}>
//       {[1,2,3,4,5].map(v => (
//         <span key={v} style={{ cursor: readOnly ? 'default' : 'pointer', fontSize: size, color: v <= (hover || rating) ? '#f59e0b' : '#ccc', transition: 'color 0.15s' }}
//           onClick={() => !readOnly && setRating(v)}
//           onMouseEnter={() => !readOnly && setHover(v)}
//           onMouseLeave={() => !readOnly && setHover(null)}>★</span>
//       ))}
//     </div>
//   );
// };
// export default StarRating;
