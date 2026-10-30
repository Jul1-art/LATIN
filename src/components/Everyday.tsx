import React from 'react';
import { IconArrow, IconDiagonal } from './Icons';

interface EverydayProps {
  onOpenQuote: (index: number) => void;
}

export const Everyday: React.FC<EverydayProps> = ({ onOpenQuote }) => {
  return (
    <section className="everyday" id="au-quotidien" aria-labelledby="everyday-title">
      <div className="wrap">
        <div className="everyday-heading">
          <div>
            <p className="everyday-eyebrow">
              Le latin au quotidien <span aria-hidden="true">/</span> VIII découvertes
            </p>
            <h2 id="everyday-title">
              Le latin,<br />
              <em>incognito.</em>
            </h2>
          </div>
          <p className="everyday-intro">
            Sur une calandre, dans un sortilège ou au détour d’une phrase. On le croise partout. Et parfois, on le parle déjà.
          </p>
        </div>

        <div className="everyday-features">
          <article className="everyday-feature modern-audi" aria-labelledby="audi-title">
            <div className="everyday-card-top">
              <p className="everyday-category">Mobilité &amp; Ingénierie</p>
              <span className="everyday-index" aria-hidden="true">01</span>
            </div>
            <div className="audi-etymology" aria-hidden="true">
              <span lang="de">Horch</span>
              <IconArrow />
              <span>latin</span>
            </div>
            <h3 id="audi-title" lang="la">Audi</h3>
            <p className="everyday-translation">« Écoute ! »</p>
            <p className="everyday-description">
              Le nom du constructeur traduit le mot allemand <span lang="de">« horch »</span>, impératif du verbe <span lang="de">horchen</span> : écouter. Le nom d’August Horch, le fondateur, devient ainsi Audi.
            </p>
          </article>

          <article className="everyday-feature modern-expecto" aria-labelledby="expecto-title">
            <div className="everyday-card-top">
              <p className="everyday-category">Imaginaire populaire</p>
              <span className="everyday-index" aria-hidden="true">02</span>
            </div>
            <div className="expecto-halo" aria-hidden="true" />
            <div className="expecto-copy">
              <h3 id="expecto-title" lang="la">
                Expecto<br />
                <em>Patronum</em>
              </h3>
              <p className="everyday-translation">« J’attends un protecteur »</p>
              <p className="everyday-description">
                Dans l’univers de Harry Potter, quelques mots latins suffisent à invoquer une présence protectrice. Une langue ancienne, un imaginaire bien vivant.
              </p>
            </div>
          </article>
        </div>

        <div className="everyday-notes">
          <article className="modern-acer" aria-labelledby="acer-title">
            <div className="everyday-card-top">
              <p className="everyday-category">Technologie</p>
              <span className="everyday-index" aria-hidden="true">03</span>
            </div>
            <div className="acer-definition">
              <h3 id="acer-title" lang="la">Acer</h3>
              <div>
                <p className="everyday-translation">« Vif &amp; Piquant »</p>
                <p className="everyday-description">
                  Derrière le nom familier de l’informatique, un adjectif latin : vif, aigu, piquant.
                </p>
              </div>
            </div>
          </article>

          <article className="modern-etc" aria-labelledby="etc-title">
            <div className="everyday-card-top">
              <p className="everyday-category">Dans nos phrases</p>
              <span className="everyday-index" aria-hidden="true">04</span>
            </div>
            <div className="etc-definition">
              <span className="etc-mark" aria-hidden="true">etc.</span>
              <div>
                <h3 id="etc-title" lang="la">Et cetera</h3>
                <p className="everyday-translation">« Et toutes les autres choses »</p>
                <p className="everyday-description">
                  Trois lettres pour laisser la liste ouverte. Littéralement : « et les autres choses ».
                </p>
              </div>
            </div>
          </article>
        </div>

        <article className="modern-asics" aria-labelledby="asics-title">
          <div className="everyday-card-top">
            <p className="everyday-category">Philosophie &amp; Sport</p>
            <span className="everyday-index" aria-hidden="true">05</span>
          </div>
          <div className="asics-heading">
            <div>
              <p className="asics-kicker">Une marque. Cinq mots.</p>
              <h3 id="asics-title">ASICS</h3>
            </div>
            <p className="asics-intro">
              Une âme saine<br />
              dans un corps sain.
            </p>
          </div>
          <dl className="asics-words" aria-label="Les cinq mots de la devise ASICS">
            <div>
              <dt lang="la"><span>A</span>nima</dt>
              <dd>L’âme</dd>
            </div>
            <div>
              <dt lang="la"><span>S</span>ana</dt>
              <dd>Saine</dd>
            </div>
            <div>
              <dt lang="la"><span>I</span>n</dt>
              <dd>Dans</dd>
            </div>
            <div>
              <dt lang="la"><span>C</span>orpore</dt>
              <dd>Un corps</dd>
            </div>
            <div>
              <dt lang="la"><span>S</span>ano</dt>
              <dd>Sain</dd>
            </div>
          </dl>
          <div className="asics-bottom">
            <p>
              Le nom assemble les initiales de <span lang="la">Anima Sana In Corpore Sano</span>, une variation de la célèbre maxime de Juvénal.
            </p>
            <button
              type="button"
              className="text-button"
              onClick={() => onOpenQuote(5)}
            >
              Lire la maxime <IconDiagonal />
            </button>
          </div>
        </article>

        <div className="everyday-lexicon" aria-labelledby="lexicon-title">
          <div className="lexicon-heading">
            <h3 id="lexicon-title">Dans la conversation.</h3>
            <p>Trois expressions à redécouvrir. Ouvrez-les.</p>
          </div>
          <div className="lexicon-entries">
            <details className="lexicon-entry">
              <summary>
                <h4>
                  <span lang="la">A priori</span>
                  <span className="lexicon-meaning">Au premier abord</span>
                </h4>
              </summary>
              <div className="lexicon-explanation">
                <p>Avant l’expérience ou la vérification, à partir d’une première idée.</p>
                <p className="lexicon-example">« A priori, cette idée devrait fonctionner. »</p>
              </div>
            </details>

            <details className="lexicon-entry">
              <summary>
                <h4>
                  <span lang="la">Vice versa</span>
                  <span className="lexicon-meaning">Ordre changé</span>
                </h4>
              </summary>
              <div className="lexicon-explanation">
                <p>On inverse les rôles ou le sens de la relation : et réciproquement.</p>
                <p className="lexicon-example">« Je t’aide, et vice versa. »</p>
              </div>
            </details>

            <details className="lexicon-entry">
              <summary>
                <h4>
                  <span lang="la">A contrario</span>
                  <span className="lexicon-meaning">Au contraire</span>
                </h4>
              </summary>
              <div className="lexicon-explanation">
                <p>On examine le cas opposé pour en tirer une autre conclusion.</p>
                <p className="lexicon-example">Une expression pour raisonner par opposition.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
};
