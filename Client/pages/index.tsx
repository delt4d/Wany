import { NextPage } from 'next';
import GameList from "@components/GameList";
import styles from "@styles/Home.module.css";
import { useEffect, useState } from 'react';
import useInput from 'src/hooks/useInput';
import Modal from '@components/Modal';

const Home: NextPage = () => {
  const search = useInput("");
  const [gamesSearchValue, setGamesSearchValue] = useState("");

  useEffect(() => {
    document.title = "Home";
  }, []);

  useEffect(() => {
    handleSearch();
  }, [search.value]);

  const handleSearch = (function () {
    var getTimeWindow = () => search.value.trim().length == 0 ? 1000 : 800;
    var timeout: NodeJS.Timeout | null;

    const handleSearch = async function () {
      if (timeout) {
        setGamesSearchValue(search.value);
        timeout = null;
      }
    }

    return async function () {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(async function () {
        await handleSearch();
      }, getTimeWindow());
    }
  }());

  return (
    <>
      <section className={styles.ContainerSearch}>
        <div className={styles.Search}>
          <input type="search" placeholder="Pesquise seu jogo" value={search.value} onChange={search.onChange} />
        </div>
      </section>

      {/* <Modal>
        <div></div>
      </Modal> */}

      <GameList search={gamesSearchValue} />
    </>
  )
}

export default Home