"use client"; // this is a client component

import React, { useState, useEffect } from "react";
import gsap from "gsap";
import styles from './lyrics.module.scss'

function Lyrics() {
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(0);
    const [currentLine, setCurrentLine] = useState(0);
    const [lines, setLines] = useState([]);
    useEffect(() => {
        const fetchLyrics = async () => {
            const res = await fetch("/lyrics.txt");
            const text = await res.text();
            const songs = text.split(">").map((song) => {
                return {
                    title: song.split("\n")[0],
                    lyrics: song.split("\n").slice(1).filter((line) => line !== ""),
                };
            }).filter((song) => song.lyrics.length > 0);

            console.log(songs)
            setSongs(songs);
            setLines(songs[currentSong].lyrics);
        };
        fetchLyrics();

        window.addEventListener("keydown", handleKeyPress);
    }, []);

    useEffect(() => {
        setLines(songs?.[currentSong]?.lyrics || []);
        setCurrentLine(0);
    }, [currentSong]);

    const handleClick = () => {
        setCurrentLine((prevLine) => prevLine + 1);
    };
    const handleKeyPress = (e) => {
        if (e.key === "ArrowRight") {
            nextLine();
        } else if (e.key === "ArrowLeft") {
            prevLine();
        } else if (e.key === "a") {
            prevTrack();
        } else if (e.key === "s") {
            nextTrack();
        }
    };

    const nextLine = () => {
        setCurrentLine((prev) => {
            if (prev + 1 === lines.length) {
                return 0;
            }
            return prev + 1;
        });
    };

    const prevLine = () => {
        setCurrentLine((prev) => {
            if (prev === 0) {
                return lines.length - 1;
            }
            return prev - 1;
        });
    };

    const nextTrack = () => {
        setCurrentSong((prev) => {
            if (prev + 1 === songs.length) {
                return 0;
            }
            return prev + 1;
        });

    };

    const prevTrack = () => {
        setCurrentSong((prev) => {
            if (prev === 0) {
                return songs.length - 1;
            }
            return prev - 1;
        });
    };

    useEffect(() => {
        // Animate the lyrics text using GSAP
        gsap.fromTo("#lyrics span", {
            opacity: 0,
            y: 10,
            scale: 5
        }, {
            duration: 0.5,
            opacity: 1,
            y: 0,
            ease: "power3.out",
            stagger: 0.05,
            onComplete: () => {
                // gsap.to("#lyrics", {
                //     duration: 0.5,
                //     opacity: 0,
                //     y: -50,
                //     delay: 1,
                // });
            },
        });
    }, [currentLine]);


    return (
        <div className={styles.appLyrics}>
            <div id="lyrics" className={styles.lyrics} key={currentLine}>
                {(lines[currentLine] || "").split("").map(letter => {
                    return <span>{letter}</span>
                })}
                {(lines[currentLine] || "").split("").length == 0 ? <span>_</span> : <span></span>}
            </div>
            <h5 className={styles.title}> #{currentSong + 1} {songs[currentSong]?.title} </h5>
        </div>

    );
};


export { Lyrics };
