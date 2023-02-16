"use client"; // this is a client component

import React, { useState, useEffect } from "react";
import gsap from "gsap";
import styles from './lyrics.module.scss'

function Lyrics() {
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(0);
    const [currentLine, setCurrentLine] = useState(0);
    const [lines, setLines] = useState([]);
    //if midi is initialized
    const [isMidiInit, setIsMidiInit] = useState(false)

    const initListenMidi = async () => {

        function onMessage(event) {
            console.log(event)

            const [channel, number, value] = event.data;
            console.log(channel, number, value)

            if (channel == 144 && number == 64 && value == 127) {
                prevLine()
            }
            if (channel == 144 && number == 65 && value == 127) {
                nextLine()
            }
            if (channel == 144 && number == 96 && value == 127) {
                prevTrack()
            }
            if (channel == 144 && number == 97 && value == 127) {
                nextTrack()
            }
        }
        // list event from midi inputs, index -1 is listening all inputs
        function listenEvent(inputs, index = -1) {
            // index = -1 means listen all midi inputs
            inputs.forEach((input, i) => {
                if (i === index || index < 0) {
                    input.onmidimessage = onMessage;
                } else {
                    input.onmidimessage = null;
                }
            });
        }
        //listen to midi
        const initMidi = async () => {
            try {
                const access = await navigator.requestMIDIAccess();
                const inputs = [...access.inputs.values()];
                console.log(inputs)
                listenEvent(inputs);
            } catch (e) {
                alert(e);
            }
        };
        initMidi()
    }
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

        //add wheel event to switch next line
        window.addEventListener("wheel", handleWheel)

        if (!isMidiInit) {
            setIsMidiInit(true)
            initListenMidi()
        }




        return () => {
            window.removeEventListener("keydown", handleKeyPress);
            window.removeEventListener("click", handleClick);
            window.removeEventListener("wheel", handleWheel)

        }


    }, []);

    useEffect(() => {
        setLines(songs?.[currentSong]?.lyrics || []);
        setCurrentLine(0);
    }, [currentSong]);


    const handleWheel = (e) => {
        //debounce
        if (e.deltaY > 0) {
            prevLine()
        } else {
            nextLine()
        }
    }
    const handleClick = () => {
        nextLine()
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

    const fadeOutText = () => {
        gsap.to("#lyrics span", {
            overwrite: true,
            opacity: 0,
            y: "random(-100, 100)",
            x: "random(-100, 100)",
            scale: 1.2,
            rotate: 1,
            filter: "blur(15px)",
            stagger: 0.01
        });
    }

    const nextLine = () => {
        //fade out all the texts

        fadeOutText()
        setTimeout(() => {
            setCurrentLine((prev) => {
                if (prev + 1 === lines.length) {
                    return 0;
                }
                return prev + 1;
            });
        }, 500)
    };

    const prevLine = () => {
        fadeOutText()

        setTimeout(() => {
            setCurrentLine((prev) => {
                if (prev === 0) {
                    return lines.length - 1;
                }
                return prev - 1;
            });
        }, 500)
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
            duration: "random(0.2,0.5)",
            filter: "blur(0px)",
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            ease: "power3.out",
            stagger: 0.03,
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
        <>
            {/* <ul className={styles.songList} >
                {songs.map((song, index) => {
                    return (
                        <li
                            className={styles.song}
                            key={index}
                            onClick={() => {
                                setCurrentSong(index);
                            }}
                        >
                            {song.title}
                        </li>
                    );
                })}
            </ul> */}
            <div className={styles.appLyrics} key={currentSong}>
                <div id="lyrics" className={styles.lyrics} key={currentLine}
                    style={{
                        fontSize: currentLine == 1 ? "12rem" : "",
                        fontWeight: currentLine == 1 ? 800 : 500
                    }}>
                    {/* wrap letter into span to prevent line break */}

                    {(lines[currentLine] || "").split(" ").map(
                        (word, index) => {
                            return (
                                <span key={index}>
                                    {word.split("").map((letter, index) => {
                                        return (
                                            <>
                                                {/* add space if it is not the first word */}
                                                {index == 0 && currentLine != 0 ? <span>&nbsp;</span> : <></>}

                                                <span
                                                    key={index}
                                                    style={{
                                                        display: "inline-block",
                                                    }}
                                                >
                                                    {letter}
                                                </span>
                                            </>
                                        );
                                    })}
                                    {" "}
                                </span>
                            );
                        }
                    )}
                    {(lines[currentLine] || "").split("").length == 0 ? <span></span> : <span></span>}
                </div>
                <h5 className={styles.title}>
                    {/* prev track */}
                    {/* <span className={styles.prevTrack} onClick={prevTrack}>
                        &lt;&lt;

                    </span> */}

                    #{currentSong + 1} {songs[currentSong]?.title}
                    {/* line number */}
                    <span className={styles.lineNumber}>
                        &nbsp;{currentLine + 1}/{lines.length}
                    </span>

                    {/* next track */}
                    {/* <span className={styles.nextTrack} onClick={nextTrack}>
                        &gt;&gt;
                    </span> */}
                </h5>
            </div>
            <div className={styles.progressBar}
                style={{
                    width: `${(currentLine / lines.length) * 100}%`
                }}

            >


            </div>
        </>

    );
};


export { Lyrics };
