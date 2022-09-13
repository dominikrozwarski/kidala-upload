import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useSelector } from 'react-redux';
import { FileInterface } from '../../interfaces/file';
import { AppInfo, selectApp } from '../../redux/slices/appSlice';
import { BASE_URL } from '../../requests/routes';
import { detectFileType } from '../../utils/detectFileType';
import { generateRandomBetween } from '../../utils/generateRandomIntBetween';

const AudioPlayer: React.FC<{ file: FileInterface }> = ({ file }) => {
    const appInfo: AppInfo = useSelector(selectApp);

    const [playing, setPlaying] = useState(false);
    const [randImage, setRandImage] = useState<string>('');
    const [duration, setDuration] = useState<number | null>(null);
    const [playedTime, setPlayedTime] = useState<number>(0);
    const [volume, setVolume] = useState<number>(0.5);
    const [seeking, setSeeking] = useState<boolean>(false);

    const playerRef = useRef<any>(null);

    const handleSeekMouseDown = () => {
        setSeeking(false);
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayedTime(Number(e.target.value));
    };

    const handleSeekMouseUp = () => {
        setSeeking(false);
        playerRef.current?.seekTo(playedTime);
    };

    useEffect(() => {
        if (!duration) {
            const au = document.createElement('audio');

            au.src = `${BASE_URL}/${file.hash}`;

            au.addEventListener(
                'loadedmetadata',
                () => {
                    setDuration(au.duration);
                },
                false
            );
        }
    }, []);

    useEffect(() => {
        if (appInfo.files) {
            const imageFiles = appInfo.files.filter(
                (file) => detectFileType(file.name) === 'image'
            );

            const imgIndex = generateRandomBetween(0, imageFiles.length - 1);

            const imgFile = imageFiles[imgIndex];

            setRandImage(`${BASE_URL}/${imgFile.hash}`);
        }
    }, [appInfo.files]);

    if (detectFileType(file.name) !== 'audio' || !randImage) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div
                className={`flex relative w-[300px] h-[300px] ${
                    playing ? 'animate-spin-slow' : ''
                }`}
            >
                <Image
                    src="/icons/music-plate.png"
                    draggable={false}
                    layout="fill"
                    objectFit="cover"
                    priority
                />

                <div className="absolute w-full h-full flex items-center justify-center">
                    <div className="absolute w-[125px] h-[125px] bg-slate-600 rounded-full"></div>

                    <Image
                        src={randImage}
                        draggable={false}
                        width={125}
                        height={125}
                        objectFit="cover"
                        className="rounded-full"
                        placeholder="blur"
                        blurDataURL={randImage}
                    />

                    <div className="flex flex-col items-center justify-center absolute w-28 h-28 rounded-full overflow-hidden">
                        <small className="text-white italic text-xs font-bold">
                            {file.name}
                        </small>

                        <small className="text-white italic text-xs mt-4">
                            Kidala records
                        </small>
                    </div>

                    <div className="absolute w-28 h-28 rounded-full"></div>

                    <div className="w-2 h-2 rounded-full absolute bg-sky-800"></div>
                </div>
            </div>

            {duration ? (
                <div className="flex">
                    <input
                        type="range"
                        name="audio_range"
                        id="audio_range"
                        min={0}
                        max={duration}
                        step="any"
                        value={playedTime}
                        onChange={handleSeekChange}
                        className="w-96"
                        onMouseDown={handleSeekMouseDown}
                        onMouseUp={handleSeekMouseUp}
                    />
                </div>
            ) : null}

            <div className="flex items-center justify-center">
                <button
                    className="flex items-center justify-center mx-4"
                    onClick={() => setPlaying(!playing)}
                >
                    <Image
                        src={playing ? '/svg/pause.svg' : '/svg/play.svg'}
                        width={30}
                        height={30}
                    />
                </button>

                <input
                    type="range"
                    name="audio_range"
                    id="audio_range"
                    min={0}
                    max={1}
                    step="any"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-20"
                />
            </div>

            <div className="hidden">
                <ReactPlayer
                    ref={playerRef}
                    url={`${BASE_URL}/${file.hash}`}
                    playing={playing}
                    volume={volume}
                    onProgress={(progress) => {
                        setPlayedTime(progress.playedSeconds);
                    }}
                />
            </div>
        </div>
    );
};

export default AudioPlayer;
