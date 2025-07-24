"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const SENTENCE_BANK = [
  { sentence: "I am a student", level: 1 },
  { sentence: "I like reading books", level: 2 },
  { sentence: "I like reading books every morning", level: 3 },
  { sentence: "I like reading books every morning because I am a student", level: 4 },
];

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
const getNextSentence = (level) => SENTENCE_BANK.find((s) => s.level === level + 1);
const getFeedback = (input, target) => {
  const userWords = input.trim().toLowerCase().split(" ");
  const targetWords = target.trim().toLowerCase().split(" ");
  const feedback = [];
  userWords.forEach((word, i) => {
    if (i >= targetWords.length || word !== targetWords[i]) {
      feedback.push(`位置 ${i + 1} 应该是 '${targetWords[i]}'`);
    }
  });
  if (userWords.length < targetWords.length) {
    feedback.push("句子不完整");
  } else if (userWords.join(" ") === targetWords.join(" ")) {
    feedback.push("句子正确！干得好！");
  }
  return feedback;
};

export default function EnglishGame() {
  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState(getNextSentence(0));
  const [shuffledWords, setShuffledWords] = useState([]);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (target) {
      setShuffledWords(shuffle([...target.sentence.split(" ")]));
    }
  }, [target]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    const fb = getFeedback(input, target.sentence);
    setFeedback(fb);
    if (fb[fb.length - 1].includes("正确")) {
      setReviewQueue([...reviewQueue, { sentence: target.sentence, reviewTime: Date.now() + 10000 }]);
      const next = getNextSentence(level);
      if (next) {
        setLevel(level + 1);
        setTarget(next);
        setInput("");
      } else {
        setTarget(null);
      }
    }
  };

  const handleReview = (item) => {
    const fb = getFeedback(input, item.sentence);
    setFeedback(fb);
    if (fb[fb.length - 1].includes("正确")) {
      setReviewQueue(reviewQueue.filter((r) => r !== item));
      setInput("");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center"
      >
        英语构句学习游戏
      </motion.h1>

      {target ? (
        <Card>
          <CardContent className="p-4 space-y-4">
            <p className="text-lg font-medium">将以下单词组成一个正确的句子：</p>
            <div className="flex flex-wrap gap-2">
              {shuffledWords.map((word, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-blue-100 text-blue-800"
                >
                  {word}
                </span>
              ))}
            </div>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请输入完整句子..."
            />
            <Button onClick={handleSubmit}>提交</Button>
            <ul className="text-sm text-gray-600 list-disc pl-4">
              {feedback.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <p className="text-center text-green-600 font-medium">恭喜你完成所有级别！</p>
      )}

      {reviewQueue
        .filter((r) => r.reviewTime <= now)
        .map((r, i) => (
          <Card key={i} className="bg-yellow-50">
            <CardContent className="p-4 space-y-2">
              <p>🔁 复习：请重新输入这句</p>
              <p className="italic text-gray-600">{r.sentence}</p>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="重新输入句子..."
              />
              <Button onClick={() => handleReview(r)}>提交复习</Button>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
