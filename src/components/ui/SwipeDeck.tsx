"use client";

import React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

export interface DeckCardBase {
  id: string;
}

interface SwipeDeckProps<T extends DeckCardBase> {
  items: T[];
  current: number;
  onSelect: (index: number) => void;
  renderCard: (item: T, isTop: boolean, index: number, total: number) => React.ReactNode;
  className?: string;
}

function DeckCard<T extends DeckCardBase>({
  item,
  isTop,
  level,
  index,
  total,
  onSwipe,
  renderCard,
}: {
  item: T;
  isTop: boolean;
  level: number;
  index: number;
  total: number;
  onSwipe: (dir: 1 | -1) => void;
  renderCard: (item: T, isTop: boolean, index: number, total: number) => React.ReactNode;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-340, 0, 340], [-16, 0, 16]);

  const scale = 1 - level * 0.055;
  const y = level * 18;
  const fan = level === 0 ? 0 : level === 1 ? -2 : 2;

  const fly = (dir: 1 | -1) => {
    animate(x, dir * 700, { type: "spring", stiffness: 240, damping: 24 }).then(() => {
      x.set(0);
      onSwipe(dir);
    });
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (!isTop) return;
    if (info.offset.x > 120) fly(1);
    else if (info.offset.x < -120) fly(-1);
    else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  };

  return (
    <motion.div
      style={{ x, rotate, zIndex: 30 - level }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={isTop ? 0.85 : 0}
      onDragEnd={handleDragEnd}
      className="absolute inset-0"
    >
      <motion.div
        animate={{ scale, y, rotate: fan }}
        transition={{ duration: 0.5, ease }}
        className={`h-full ${isTop ? "cursor-grab active:cursor-grabbing touch-none" : "pointer-events-none"}`}
      >
        {renderCard(item, isTop, index, total)}
      </motion.div>
    </motion.div>
  );
}

export default function SwipeDeck<T extends DeckCardBase>({
  items,
  current,
  onSelect,
  renderCard,
  className,
}: SwipeDeckProps<T>) {
  const len = items.length;
  if (len === 0) return null;

  const order: number[] = [];
  for (let d = 0; d < 3; d++) {
    const idx = (current + d) % len;
    if (order.includes(idx)) break;
    order.push(idx);
  }

  const handleSwipe = (dir: 1 | -1) => {
    onSelect(((current + dir + len) % len + len) % len);
  };

  return (
    <div className={`relative w-full ${className ?? ""}`}>
      {order.map((itemIdx, level) => (
        <DeckCard
          key={items[itemIdx].id}
          item={items[itemIdx]}
          isTop={level === 0}
          level={level}
          index={level === 0 ? current : 0}
          total={len}
          onSwipe={handleSwipe}
          renderCard={renderCard}
        />
      ))}
    </div>
  );
}