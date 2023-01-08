import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { projects, Project } from '@api';
import { bufferToUrlObject } from '@helpers/blob-convertions';
import { NotificationTypes, showNotification } from '@helpers/notifications';
import { Block, Loading } from "notiflix";
import styles from '@styles/GameList.module.css'
import { Chat, Download, Star } from "phosphor-react";
import { useAuth } from '@contexts/auth';

interface IGameListProps {
    search: string
}

const gamesOffset = 10;

const GameList = ({ search }: IGameListProps) => {
    const [games, setGames] = useState<Project[]>([]);
    const [loadings, setLoadings] = useState(0);
    const [gamesIndex, setGamesIndex] = useState(0);
    const [totalGamesCount, setTotalGamesCount] = useState(0);
    const gamesRef = useRef<Project[]>([]);

    const auth = useAuth();

    const addLoading = (text?: string) => {
        Loading.remove();
        Loading.circle(text);
        setLoadings(current => ++current);
    }

    const removeLoading = () => {
        setLoadings(current => {
            if (current > 1) return --current;
            Loading.remove();
            return 0;
        });
    };

    const renderProjects = () => {
        return games.map((game, index) =>
            <div key={index} className={styles.Game}>
                <h4 title={game.name.toUpperCase()} className={styles.GameTitle}>{game.name.toUpperCase()}</h4>

                <span><Star style={{ cursor: auth.user ? "pointer" : "" }} weight={game.putStar ? "fill" : "regular"} onClick={() => setGameStar(game.id)} />{game.allStars}</span>

                <div title={game.description} className={styles.GameInfo} style={{ backgroundImage: `url(${game.image != null ? bufferToUrlObject(game.image.data) : null})` }}>
                    <div className={styles.GameBottom}>
                        <div className={styles.GameUserAvatar}>
                            {game.user.avatar &&
                                <img title={game.user.username.toUpperCase()} alt={`avatar do usuário ${game.user.username}`} src={bufferToUrlObject(game.user.avatar.data)} />
                            }
                        </div>

                        <div style={{ flexGrow: 1, paddingLeft: "1rem" }}>{game.user.username}</div>

                        {/*<button title={`COMENTAR ${game.name.toUpperCase()}`} className={styles.BtnComment} onClick={() => comment(game.id)}>
                            <Chat size={30} />
                        </button>*/}

                        <button title={`BAIXAR ${game.name.toUpperCase()}`} className={styles.BtnDownload} onClick={() => download(game.id)}>
                            <Download size={30} />
                        </button>
                    </div>
                </div>
            </div>)
    }

    const download = async (id: string) => {
        addLoading();
        await projects.download(id);
        removeLoading();
    }

    const comment = async (id: string) => {
    }

    const getProjectsImages = async () => {
        try {
            const result = await projects.getImages(gamesRef.current.map(_ => _.id));

            setGames((current) => {
                const gamesCopy = current.slice();

                result.map(game => {
                    const index = gamesCopy.findIndex(_ => _.id === game.id)
                    if (index !== -1) { gamesCopy[index].image = game.image; }
                });
                return [...gamesCopy];
            });
        }
        catch (err: any) {
            showNotification("Não foi possível carregar as imagens.", NotificationTypes.Error);
        }
    }

    const getProjects = async (games: Project[] = [], incremetIndex = false) => {
        Loading.circle("Carregando projetos...");

        try {
            const list = await projects.getAll({ search, startIndex: gamesIndex, offset: gamesOffset, userId: auth.user?.id });

            if (incremetIndex) {
                setTotalGamesCount(list.length == 0 ? 0 : list[0].totalCount);
                setGamesIndex(currentIndex => currentIndex + gamesOffset);
            }

            setGames(() => [...games, ...list]);

            getProjectsImages();
        }
        catch (err: any) {
            showNotification("Não foi possível obter a lista de projetos. " + err.message, NotificationTypes.Error);
        }
        finally {
            Loading.remove();
        }
    }

    const setGameStar = async (gameId: string) => {
        if (!auth.user) return;

        const updateGames = () => {
            setGames(current => {
                var list = current.slice();
                var index = list.findIndex(game => game.id == gameId);

                if (index != -1) {
                    var project = { ...list[index] };

                    project.putStar = !project.putStar;
                    project.allStars = (project.putStar ? project.allStars + 1 : project.allStars - 1);

                    list.splice(index, 1, project);
                }

                return [...list];
            });
        }

        projects.setStar(gameId)
            .catch((err: any) => {
                updateGames();
                console.error(new Error(err.message));
                showNotification("Não foi possível adicionar ou remover a estrela ao projeto.", NotificationTypes.Error);
            });

        updateGames();
    }

    useEffect(() => {
        gamesRef.current = games;
    }, [games]);

    useEffect(() => {
        getProjects();
    }, [search]);

    return (
        <>
            <section className={styles.GameList}>
                {renderProjects()}
            </section>

            {totalGamesCount != 0 && gamesIndex < totalGamesCount &&
                <button onClick={() => getProjects(games, true)} style={{
                    width: '20vw',
                    height: '3.5rem',
                    margin: '0 auto',
                    display: 'block',
                    color: '#fff',
                    background: 'var(--primary-color)',
                    borderRadius: '4px'
                }}>CARREGAR MAIS</button>
            }
        </>
    )
}

export default GameList;