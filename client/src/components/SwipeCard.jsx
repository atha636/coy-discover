import { forwardRef, useImperativeHandle, useState } from 'react';
import { motion, useTransform, useAnimation } from 'framer-motion';

const THRESHOLD = 110;   // px dragged to commit
const VELOCITY = 500;    // px/s flick to commit

// dragX is a motion value shared by the whole deck, so the card behind
// can react (scale up / rise) while the top card is being dragged.
const SwipeCard = forwardRef(function SwipeCard({ profile, isTop, dragX, onSwiped }, ref) {
  const controls = useAnimation();
  const [imgFailed, setImgFailed] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const rotate = useTransform(dragX, [-300, 0, 300], [-16, 0, 16]);
  const likeOpacity = useTransform(dragX, [20, 110], [0, 1]);
  const nopeOpacity = useTransform(dragX, [-110, -20], [1, 0]);
  const likeScale = useTransform(dragX, [20, 110], [0.7, 1.1]);
  const nopeScale = useTransform(dragX, [-110, -20], [1.1, 0.7]);
  const behindScale = useTransform(dragX, [-300, 0, 300], [1, 0.94, 1]);
  const behindY = useTransform(dragX, [-300, 0, 300], [0, 14, 0]);

  const fling = async (dir) => {
    if (leaving) return;
    setLeaving(true);
    navigator.vibrate?.(12);
    // Finish the exit animation first, then tell the parent (so the card never vanishes mid-flight)
    await controls.start({
      x: dir * 650,
      opacity: 0,
      transition: { type: 'tween', duration: 0.32, ease: [0.4, 0, 1, 1] }
    });
    onSwiped(profile, dir > 0 ? 'like' : 'pass');
  };

  useImperativeHandle(ref, () => ({
    swipe: (dir) => fling(dir),
    reset: () => {
      setLeaving(false);
      controls.start({ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 28 } });
    }
  }));

  const onDragEnd = (_e, info) => {
    if (info.offset.x > THRESHOLD || info.velocity.x > VELOCITY) fling(1);
    else if (info.offset.x < -THRESHOLD || info.velocity.x < -VELOCITY) fling(-1);
    else controls.start({ x: 0, transition: { type: 'spring', stiffness: 500, damping: 26 } });
  };

  return (
    <motion.div
      className={`card ${isTop ? 'top' : 'behind'}`}
      style={isTop ? { x: dragX, rotate } : { scale: behindScale, y: behindY }}
      animate={controls}
      drag={isTop && !leaving ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={onDragEnd}
    >
      {imgFailed ? (
        <div className="photo fallback">{profile.name[0]}</div>
      ) : (
        <img className="photo" src={profile.photo} alt={profile.name} draggable={false} onError={() => setImgFailed(true)} />
      )}

            {isTop && (
        <>
          <motion.div className="stamp like" style={{ opacity: likeOpacity, scale: likeScale }}>LIKE</motion.div>
          <motion.div className="stamp nope" style={{ opacity: nopeOpacity, scale: nopeScale }}>NOPE</motion.div>
        </>
      )}

      <div className="info">
        <h2>{profile.name}, <span>{profile.age}</span></h2>
        <p className="city">📍 {profile.city}</p>
        <p className="bio">{profile.bio}</p>
        <div className="chips">
          {profile.interests.map((i) => <span key={i}>{i}</span>)}
        </div>
      </div>
    </motion.div>
  );
});

export default SwipeCard;