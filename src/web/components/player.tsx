import { useEffect, useRef, useCallback, useState } from "react";
import { usePlayerStore, useUIStore } from "@/lib/store";
import { getHighQualityImage, formatDuration, decodeHtml } from "@/lib/api";
import { Slider } from "@/components/ui/slider";
import LikeButton from "./like-button";
import Equalizer from "./equalizer";
import GlobalEqualizer from "./global-equalizer";
import CanvasVisualizer from "./canvas-visualizer";
import KaraokeView from "./karaoke-view";
import { Engine } from "@/lib/audioEngine";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Volume1, ListMusic, ChevronDown, ChevronUp, Maximize2
} from "lucide-react";
import { useLocation } from "wouter";

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [, setLocation] = useLocation();
  const { isFullScreenPlayer, toggleFullScreen, setFullScreen } = useUIStore();

  const {
    currentSong, isPlaying, currentTime, duration, volume, isMuted, shuffle, repeat, isBuffering,
    setAudioRef, togglePlay, nextTrack, prevTrack, seekTo, setCurrentTime, setDuration,
    setVolume, toggleMute, toggleShuffle, toggleRepeat, setBuffering,
  } = usePlayerStore();

  useEffect(() => {
    if (audioRef.current) {
      setAudioRef(audioRef.current);
      audioRef.current.volume = volume;
      Engine.init(audioRef.current);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, [setCurrentTime]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setBuffering(false);
    }
  }, [setDuration, setBuffering]);

  const handleEnded = useCallback(() => nextTrack(), [nextTrack]);
  const handleWaiting = useCallback(() => setBuffering(true), [setBuffering]);
  const handleCanPlay = useCallback(() => setBuffering(false), [setBuffering]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      if (e.code === "ArrowRight" && e.shiftKey) nextTrack();
      if (e.code === "ArrowLeft" && e.shiftKey) prevTrack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay, nextTrack, prevTrack]);

  if (!currentSong) {
    return (
      <>
        <audio ref={audioRef} />
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl h-[72px] md:h-[80px] neuglass rounded-2xl flex items-center justify-center z-50">
          <p className="text-[#9ba1ad] text-sm font-medium">Search & play a song to get started</p>
        </div>
      </>
    );
  }

  const image = getHighQualityImage(currentSong.image);
  const artistNames = currentSong.artists?.primary?.map((a) => decodeHtml(a.name)).join(", ") || "";
  const songName = decodeHtml(currentSong.name);
  const progress = duration ? (currentTime / duration) * 100 : 0;

  // ─── Player Render ───
  return (
    <>
      <audio ref={audioRef} crossOrigin="anonymous" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleEnded} onWaiting={handleWaiting} onCanPlay={handleCanPlay} />
      
      {isFullScreenPlayer ? (
        <div className="fixed inset-0 z-[100] flex flex-col animate-slide-up"
          style={{ background: `linear-gradient(180deg, #1e2028 0%, #0c0d12 100%)` }}>
          
          {/* Immersive Backgrounds */}
          <CanvasVisualizer />

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <button onClick={() => setFullScreen(false)} className="text-white p-2 -ml-2">
              <ChevronDown size={24} />
            </button>
            <span className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider">Now Playing</span>
            <button onClick={() => { setFullScreen(false); setLocation("/queue"); }} className="text-white p-2 -mr-2">
              <ListMusic size={20} />
            </button>
          </div>

          {/* Main Split Display (Art Left / Karaoke Right) */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10 w-full max-w-[1400px] mx-auto">
            
            {/* Album art */}
            <div className="md:flex-1 flex items-center justify-center p-6 md:p-12 shrink-0 h-[35vh] md:h-auto">
              <div className={`relative h-full aspect-square md:w-full md:h-auto md:max-w-[420px] ${isPlaying ? "animate-pulse-ring" : ""}`}>
                <img
                  src={image}
                  alt={songName}
                  className={`w-full h-full object-cover rounded-lg shadow-2xl shadow-black/60 transition-transform duration-700 ${isPlaying ? "scale-100" : "scale-95"}`}
                />
                {isBuffering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                    <div className="w-10 h-10 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Karaoke Lyrics */}
            <div className="flex-[1.2] relative pt-4 md:pt-0">
                <KaraokeView />
            </div>
            
          </div>

          {/* Song info + controls */}
          <div className="px-8 pb-10 space-y-5 relative z-10 w-full max-w-[1400px] mx-auto">
            {/* Title + like */}
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-4">
                <p className="text-lg font-bold text-white truncate">{songName}</p>
                <p className="text-sm text-[#b3b3b3] truncate">{artistNames}</p>
              </div>
              <LikeButton song={currentSong} size={22} />
            </div>

            {/* Progress */}
            <div>
              <Slider value={[currentTime]} max={duration || 100} step={0.5} onValueChange={([v]) => seekTo(v)}
                className="[&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-[#4d4d4d] [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:w-4 [&_[data-slot=slider-thumb]]:h-4 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-0" />
              <div className="flex justify-between mt-1.5">
                <span className="text-[11px] text-[#b3b3b3] tabular-nums">{formatDuration(currentTime)}</span>
                <span className="text-[11px] text-[#b3b3b3] tabular-nums">{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <button onClick={toggleShuffle} className={`p-2 ${shuffle ? "text-primary" : "text-[#b3b3b3]"}`}>
                <Shuffle size={22} />
              </button>
              <button onClick={prevTrack} className="text-white p-2">
                <SkipBack size={28} fill="currentColor" />
              </button>
              <button onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform">
                {isPlaying ? <Pause size={28} fill="black" className="text-black" /> : <Play size={28} fill="black" className="text-black ml-1" />}
              </button>
              <button onClick={nextTrack} className="text-white p-2 z-10">
                <SkipForward size={28} fill="currentColor" />
              </button>
              <button onClick={toggleRepeat} className={`p-2 z-10 ${repeat !== "off" ? "text-primary" : "text-[#b3b3b3]"}`}>
                {repeat === "one" ? <Repeat1 size={22} /> : <Repeat size={22} />}
              </button>
            </div>
            
            {/* Full Screen Volume Rocker & Equalizer (Desktop) */}
            <div className="items-center justify-center gap-3 pt-4 w-full max-w-[320px] mx-auto z-10 hidden md:flex">
              <GlobalEqualizer />
              <button onClick={toggleMute} className="text-[#b3b3b3] hover:text-white transition-colors p-1.5 opacity-80 hover:opacity-100">
                {isMuted || volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
              </button>
              <Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={([v]) => setVolume(v)}
                className="flex-1 [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-white/20 [&_[data-slot=slider-range]]:bg-white hover:[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:w-4 [&_[data-slot=slider-thumb]]:h-4 [&_[data-slot=slider-thumb]]:opacity-0 hover:[&_[data-slot=slider-thumb]]:opacity-100 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-0 shadow-lg" />
            </div>
          </div>
        </div>
      ) : (
      <div className="fixed bottom-[68px] left-2 right-2 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-[800px] h-[64px] md:h-[80px] neuglass rounded-2xl z-50">
        {/* Ambient background progress fill */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>

        {/* Glossy top edge highlight */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-white/5 rounded-b-lg overflow-hidden pointer-events-none">
          <div className="h-full bg-primary/80 shadow-[0_0_8px_var(--color-primary)] transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>

        <div className="relative flex items-center h-full gap-3 pt-1 px-3 md:px-5">
          {/* Left — Song info (clickable to expand on mobile) */}
          <button className="flex items-center gap-3 min-w-0 flex-1 md:flex-none md:w-[30%] text-left" onClick={() => setFullScreen(true)}>
            {image && (
              <div className="relative shrink-0">
                <img src={image} alt={songName}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-md object-cover shadow-lg transition-all duration-500 ${isPlaying ? "shadow-primary/20" : ""}`} />
                {isBuffering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )}
            <div className="min-w-0">
              <p className={`text-sm font-semibold truncate leading-tight ${isPlaying ? "text-white" : "text-[#b3b3b3]"}`}>
                {songName}
              </p>
              <p className="text-[11px] text-[#a7a7a7] truncate mt-0.5">{artistNames}</p>
            </div>
          </button>

          {/* Like button (mobile visible) */}
          <div className="md:hidden">
            <LikeButton song={currentSong} size={20} />
          </div>

          {/* Mobile play/pause */}
          <button onClick={togglePlay} className="md:hidden w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
            {isPlaying ? <Pause size={18} fill="black" className="text-black" /> : <Play size={18} fill="black" className="text-black ml-0.5" />}
          </button>

          {/* Center — Controls (desktop) */}
          <div className="hidden md:flex flex-col items-center flex-1 max-w-[45%] gap-1">
            <div className="flex items-center gap-5">
              <button onClick={toggleShuffle} className={`p-1 transition-colors ${shuffle ? "text-primary" : "text-[#b3b3b3] hover:text-white"}`}>
                <Shuffle size={16} />
              </button>
              <button onClick={prevTrack} className="text-[#b3b3b3] hover:text-white transition-colors p-1">
                <SkipBack size={18} fill="currentColor" />
              </button>
              <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform">
                {isPlaying ? <Pause size={16} fill="black" className="text-black" /> : <Play size={16} fill="black" className="text-black ml-0.5" />}
              </button>
              <button onClick={nextTrack} className="text-[#b3b3b3] hover:text-white transition-colors p-1">
                <SkipForward size={18} fill="currentColor" />
              </button>
              <button onClick={toggleRepeat} className={`p-1 transition-colors ${repeat !== "off" ? "text-primary" : "text-[#b3b3b3] hover:text-white"}`}>
                {repeat === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </button>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span className="text-[10px] text-[#a7a7a7] w-9 text-right tabular-nums">{formatDuration(currentTime)}</span>
              <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={([v]) => seekTo(v)}
                className="flex-1 [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-[#4d4d4d] [&_[data-slot=slider-range]]:bg-white hover:[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:w-3 [&_[data-slot=slider-thumb]]:h-3 [&_[data-slot=slider-thumb]]:opacity-0 hover:[&_[data-slot=slider-thumb]]:opacity-100 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-0" />
              <span className="text-[10px] text-[#a7a7a7] w-9 tabular-nums">{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Right — Volume + utils (desktop) */}
          <div className="hidden md:flex items-center justify-end gap-2 w-[30%]">
            <LikeButton song={currentSong} size={16} />
            <button onClick={() => setLocation("/queue")} className="text-[#b3b3b3] hover:text-white transition-colors p-1.5">
              <ListMusic size={16} />
            </button>
            <GlobalEqualizer />
            <button onClick={toggleMute} className="text-[#b3b3b3] hover:text-white transition-colors p-1.5">
              {isMuted || volume === 0 ? <VolumeX size={16} /> : volume < 0.5 ? <Volume1 size={16} /> : <Volume2 size={16} />}
            </button>
            <Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={([v]) => setVolume(v)}
              className="w-24 [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-[#4d4d4d] [&_[data-slot=slider-range]]:bg-white hover:[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:w-3 [&_[data-slot=slider-thumb]]:h-3 [&_[data-slot=slider-thumb]]:opacity-0 hover:[&_[data-slot=slider-thumb]]:opacity-100 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-0" />
            <button onClick={() => setFullScreen(true)} className="text-[#b3b3b3] hover:text-white transition-colors p-1.5">
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  );
}
