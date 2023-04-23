import { useState, useEffect, useRef } from "react";
import "./App.css";
import { debounce } from "lodash";
import { createApi } from "unsplash-js";

const unsplash = createApi({
  accessKey: "2PIgBi88jHGVpDXy8z7_m6q2pPyUf7jrYcdPIvLFV_A",
});

function App() {
  const [phrase, setPhrase] = useState("");
  const phraseRef = useRef();
  const [images, setImages] = useState([]);

  const imagesRef = useRef();
  const [fetching, setFetching] = useState(false);
  const fetchRef = useRef(fetching);

  function getUnsplashImages(query, page = 1) {
    setFetching(true);
    fetchRef.current = true;
    return new Promise((resolve, reject) => {
      unsplash.search
        .getPhotos({
          query,
          page,
          perPage: 1000,
        })
        .then((res) => {
          setFetching(false);
          fetchRef.current = false;
          resolve(res.response.results.map((result) => result.urls.regular));
        });
    });
  }

  useEffect(() => {
    phraseRef.current = phrase;
    if (phrase !== "") {
      debounce(() => {
        setImages([]);
        getUnsplashImages(phrase, 1).then((images) => {
          setImages(images);
          imagesRef.current = images;
        });
      }, 1000)();
    }
  }, [phrase]);

  function handleScroll(e) {
    const { scrollHeight, scrollTop, clientHeight } = e.target.scrollingElement;

    const isBottom = scrollHeight - scrollTop <= clientHeight;

    if (isBottom && !fetchRef.current) {
      getUnsplashImages(
        phraseRef.current,
        imagesRef.current.length / 5 + 1
      ).then((newImgs) => {
        imagesRef.current = [...imagesRef.current, ...newImgs];
        setImages(imagesRef.current);
      });
    }
  }

  useEffect(() => {
    document.addEventListener("scroll", handleScroll, { passive: true });

    return document.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <div className="header">
        <h1 className="gradient-text">IMAGE FINDER</h1>
        <p className="tagline">Discover the world through images with Image Finder</p>
        <input
          type="text"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          placeholder="What are you looking for?"
        />

        <div>{fetching && "fetching!!"}</div>
      </div>
      <div id="gallery">
        {images.length > 0 &&
          images.map((url) => (
              <img src={url} key={url} />
          ))}
      </div>
    </div>
  );
}

export default App;
