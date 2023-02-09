"use client"; // this is a client component

import React, { useState, useEffect } from "react";
import gsap from "gsap";
import styles from './lyrics.module.scss'

function Lyrics() {
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(0);
    const [currentLine, setCurrentLine] = useState(0);
    const [lines, setLines] = useState([]);
    // let orders = ``
    useEffect(() => {
        const fetchLyrics = async () => {
            const res = await fetch("/lyrics.txt");
            const text = await res.text();
            let songs = text.split(">").map((song) => {
                let title = song.split("\n")[0].trim()
                return {
                    title,
                    lyrics: ["", title].concat(song.split("\n").slice(1).filter((line) => line !== "")),
                };
            }).filter((song) => song.title.length > 0);


            //update order align to orders string
            // let order = orders.split("\n").map(str => str.trim())

            // let newSongs = []
            // for (let i = 0; i < order.length; i++) {
            //     for (let j = 0; j < songs.length; j++) {
            //         if (order[i] == songs[j].title) {
            //             newSongs.push(songs[j])
            //         }
            //     }
            // }
            // songs = newSongs


            console.log(songs)
            setSongs(songs);
            setLines(songs[currentSong].lyrics);
        };
        fetchLyrics();

        window.addEventListener("keydown", handleKeyPress);
        window.addEventListener("click", handleClick);
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
        } else if (e.key === "ArrowUp") {
            prevTrack();
        } else if (e.key === "ArrowDown") {
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
            y: "random(-100, 100)",
            x: "random(-100, 100)",
            scale: 1.2,
            rotate: 1,
            filter: "blur(15px)",
            // filter:
        }, {
            duration: "random(1.5,2.5)",
            filter: "blur(0px)",
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            ease: "power3.out",
            stagger: 0.2,
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
        <div className={styles.appLyrics} key={currentSong}>
            <div id="lyrics" className={styles.lyrics} key={currentLine}>
                {(lines[currentLine] || "").split("").map(letter => {
                    return <span>{letter == " " ? <span>&nbsp;</span> : letter} </span>
                })}
                {(lines[currentLine] || "").split("").length == 0 ? <span></span> : <span></span>}
            </div>
            <h5 className={styles.title}> #{currentSong + 1} {songs[currentSong]?.title} </h5>
        </div>

    );
};


export { Lyrics };
