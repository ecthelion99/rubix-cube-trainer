import React, { useState, useEffect } from "react";

const IMAGE_FOLDER = "/images/";
const SOLUTIONS_FILE = "/solutions.json";

function App() {
    const [mode, setMode] = useState("OLL"); // "OLL" or "PLL"
    const [ollImages, setOllImages] = useState([]);
    const [pllImages, setPllImages] = useState([]);
    const [solutions, setSolutions] = useState({});
    const [enabledAlgorithms, setEnabledAlgorithms] = useState({ OLL: {}, PLL: {} });
    const [currentImage, setCurrentImage] = useState("");
    const [solution, setSolution] = useState("");
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const loadImagesAndSolutions = async () => {
            try {
                const ollList = [
                    "antisune.png", "H.png", "L.png", "pi.png",
                    "sune.png", "T.png", "U.png"
                ];
                const pllList = [
                    "diagonal.png", "headlights.png", "H.png",
                    "Ua.png", "Ub.png", "Z.png"
                ];

                setOllImages(ollList);
                setPllImages(pllList);

                const response = await fetch(SOLUTIONS_FILE);
                const data = await response.json();
                setSolutions(data);

                setEnabledAlgorithms({
                    OLL: Object.fromEntries(ollList.map(img => [img, true])),
                    PLL: Object.fromEntries(pllList.map(img => [img, true]))
                });
            } catch (error) {
                console.error("Error loading resources:", error);
            }
        };

        loadImagesAndSolutions();
    }, []);

    const getAvailableImages = () => (mode === "OLL" ? ollImages : pllImages);
    
    const getEnabledImages = () => {
        return getAvailableImages().filter(img => enabledAlgorithms[mode][img]);
    };

    const getMaxHistoryLength = () => {
        const enabledCount = getEnabledImages().length;
        if (enabledCount <= 1) return 0;
        if (enabledCount === 2) return 1;
        if (enabledCount === 3) return 2;
        return 3;
    };

    const pickRandomImage = () => {
        let availableImages = getEnabledImages();
        if (availableImages.length === 0) return;

        let maxHistory = getMaxHistoryLength();

        if (availableImages.length <= maxHistory) {
            setHistory([]);
            maxHistory = getMaxHistoryLength();
        }

        let randomImage;
        do {
            randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
        } while (history.includes(randomImage) && availableImages.length > history.length);

        setHistory(prev => [...prev.slice(prev.length - (maxHistory - 1)), randomImage]);
        setCurrentImage(randomImage);
        setSolution("");
    };

    useEffect(() => {
        if (getEnabledImages().length > 0) {
            pickRandomImage();
        }
    }, [mode, enabledAlgorithms]);

    const showSolution = () => {
        const name = currentImage.split(".")[0];
        setSolution(solutions[mode][name] || "No solution available");
    };

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.code === "Space") {
                pickRandomImage();
            } else if (event.key.toLowerCase() === "s") {
                showSolution();
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [mode, currentImage, enabledAlgorithms]);

    const toggleAlgorithm = (img) => {
        setEnabledAlgorithms(prev => ({
            ...prev,
            [mode]: { ...prev[mode], [img]: !prev[mode][img] }
        }));
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            height: "100vh",
            backgroundColor: "#000",
            color: "#fff",
            overflow: "hidden"
        }}>
            {/* Main Content */}
            <div style={{ flex: 1, textAlign: "center", padding: "20px" }}>
                <h1 style={{ fontSize: "3vw", marginBottom: "10px" }}>
                    Rubik's Cube Trainer
                </h1>
                <p style={{ fontSize: "1.5vw", marginBottom: "20px" }}>
                    Press <strong>SPACE</strong> for a new scramble. Press <strong>S</strong> to reveal the solution.
                </p>

                {/* Mode Switch Buttons */}
                <div>
                    <button
                        onClick={() => setMode("OLL")}
                        style={{ marginRight: "10px", padding: "10px", fontSize: "16px" }}>
                        OLL Mode
                    </button>
                    <button
                        onClick={() => setMode("PLL")}
                        style={{ padding: "10px", fontSize: "16px" }}>
                        PLL Mode
                    </button>
                </div>

                <p style={{ fontSize: "1.5vw", margin: "20px 0" }}>
                    Current Mode: <strong>{mode}</strong>
                </p>

                {/* Image Display */}
                <div style={{
                    width: "50vh",
                    height: "50vh",
                    backgroundColor: "#222",
                    margin: "20px auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "2px solid white"
                }}>
                    {currentImage ?
                        <img
                            src={`${IMAGE_FOLDER}/${mode}/${currentImage}`}
                            alt="Algorithm"
                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                        />
                        :
                        <p>Loading images...</p>
                    }
                </div>

                {/* Solution Text */}
                <div style={{
                    height: "5vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <p style={{ fontSize: "2.5vw", fontWeight: "bold", margin: "10px 0" }}>
                        {solution}
                    </p>
                </div>
            </div>

            {/* Algorithm Toggle List (Now on the Right Side) */}
            <div style={{
                width: "20%",
                backgroundColor: "#111",
                padding: "10px",
                borderLeft: "2px solid white",
                overflowY: "auto"
            }}>
                <h2 style={{ fontSize: "1.5vw", textAlign: "center", marginBottom: "10px" }}>
                    Toggle Algorithms
                </h2>
                {getAvailableImages().map((img) => (
                    <div key={img} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                        <input
                            type="checkbox"
                            checked={enabledAlgorithms[mode][img]}
                            onChange={() => toggleAlgorithm(img)}
                            style={{ marginRight: "10px" }}
                        />
                        <span style={{ fontSize: "1vw" }}>{img.replace(".png", "")}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
