import Image from 'next/image';
import React from 'react';

function Star({
  fill = 100,
  className = "h-4 w-4",
}: {
  fill?: number; // 0 → 100
  className?: string;
}) {
  const id = Math.random().toString(36).slice(2); // unique gradient id

  return (
    <svg viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill}%`} stopColor="#f59e0b" />
          <stop offset={`${fill}%`} stopColor="#d3d5d8" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M12 2.5l2.97 6.02 6.65.97-4.81 4.69 1.14 6.64L12 17.77 6.05 20.82l1.14-6.64-4.81-4.69 6.65-.97L12 2.5z"
      />
    </svg>
  );
}

function RatingStars({
  rating,
  total = 5,
}: {
  rating: number;
  total?: number;
}) {
  return (
    <div className="flex">
      {Array.from({ length: total }).map((_, i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1) * 100;

        return <Star key={i} fill={fill} />;
      })}
    </div>
  );
}

export default function UserRating({
 avatars = [],
 rating = 5,
 title = 'Ratings',
 subtitle = 'Trusted By Client around the World',
}) {

 return (
   <div className={`flex items-center gap-4 text-white`}>
     <div className="flex -space-x-4">
       {avatars.map((src, i) => (
         <>
         {src?.img ? (
            <Image
              src={src?.img}    
              alt={`Client ${i + 1}`}
              width={30}
              height={30}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div
              className="
              h-[35px] w-[35px]
              rounded-full
              bg-gray-300
              flex items-center justify-center
              text-sm font-semibold text-gray-700
              uppercase
              "
            >
              {src?.name?.charAt(0)}
            </div>
          )}
         </>
       ))}
     </div>

     <div className="flex flex-col">
       <div className="flex items-center gap-3">
         <p className="text-xs font-medium">
           {title} {rating.toFixed(1)}
         </p>
         <div className="flex">
           <RatingStars
                    rating={rating}
                    total={5}
                  />
         </div>
       </div>
       <p className="text-[10px] text-white font-normal">{subtitle}</p>
     </div>
   </div>
 );
}