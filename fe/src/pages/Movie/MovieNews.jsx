import React from 'react';
import flowPoster1 from '../../assets/flow-poster1.jpg';
import flowPoster2 from '../../assets/flow-poster2.jpg';
import flowPoster3 from '../../assets/flow-poster3.jpg';
import flowPoster4 from '../../assets/flow-poster4.jpg'; 

const MovieNews = () => {
return (
<div className="bg-black text-white px-6 py-10 space-y-10">
<h1 className="text-3xl font-semibold text-center mb-2">Movie News</h1>
<hr className="mx-auto border-red-500 w-[400px] mb-4" />

  <div className="space-y-4">
    <img
      src={flowPoster1}
      alt="Flow poster"
      className="w-full max-w-xl mx-auto rounded-lg shadow-lg"
    />
    <div className="max-w-3xl mx-auto text-m">
      <h2 className="font-bold">
        A World-Shaking Film Announces Screening Schedule in Vietnam
      </h2>
      <p>
        Flow is the latest animated film by Latvian director Gints Zilbalodis. From the trailer alone, the film has already captivated many viewers with its poetic, visually stunning, lively, and humorous depictions of nature.
      </p>
    </div>
  </div>

  {/* Article 2 */}
  <div className="space-y-4">
    <img
      src={flowPoster2}
      alt="Flow second poster"
      className="w-full max-w-xl mx-auto rounded-lg shadow-lg"
    />
    <div className="max-w-3xl mx-auto text-m">
      <p>
        The film won the prestigious Golden Globe Award in 2025 for Best Animated Feature and was selected for the Un Certain Regard section at the 2024 Cannes Film Festival.
      </p>
      <p>
      This marks the second independent animated feature from director Gints Zilbalodis, 
      who was born in 1994. Set in a post-apocalyptic world devoid of humans, the story follows 
      a shy gray cat who is afraid of water. After its home is swept away by a flood, the cat embarks 
      on a seafaring journey with other animals in a quest for survival. The adventure of the cat and 
      its companions serves as a life lesson for humanity.      </p>
    </div>
  </div>

  {/* Article 3 */}
  <div className="space-y-4">
    <img
      src={flowPoster3}
      alt="Flow third poster"
      className="w-full max-w-xl mx-auto rounded-lg shadow-lg"
    />
    <div className="max-w-3xl mx-auto text-m">
      <p>
        Flow is also a strong contender for the Oscars, competing alongside big-budget productions from well-known studios such as Inside Out 2 (Pixar) and The Wild Robot (DreamWorks).
      </p>
    </div>
  </div>

  {/* Article 4 */}
  <div className="space-y-4">
    <img
      src={flowPoster4}
      alt="Flow fourth poster"
      className="w-full max-w-xl mx-auto rounded-lg shadow-lg"
    />
    <div className="max-w-3xl mx-auto text-m">
      <p>
      Nonetheless, thanks to his exceptional storytelling ability — previously demonstrated 
      through 2D hand-drawn animation, 3D, and CG animation (computer-generated animation) — 
      Zilbalodis once again mesmerizes audiences with gentle, captivating imagery of animals 
      and nature. He also composed and crafted the film’s soothing soundtrack himself.      </p>
    </div>
  </div>
</div>
);
};

export default MovieNews;