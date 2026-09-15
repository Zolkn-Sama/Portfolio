/**
 * Carrousel d'images en pur CSS (scroll-snap daisyUI), sans état JS : la
 * navigation passe par des ancres `#id`, donc elle marche même si le
 * JavaScript n'a pas fini de charger.
 */
export function ImageCarousel({
  images,
  folder,
  alt,
  carouselId,
}: {
  images: string[]
  /** Sous-dossier de `public/` où vivent les fichiers, ex. `projects`. */
  folder: string
  alt: string
  carouselId: string
}) {
  if (images.length === 0) return null

  return (
    <div>
      <div className="carousel w-full overflow-hidden rounded-box border border-base-300 bg-base-200/30">
        {images.map((file, i) => (
          <div key={file} id={`${carouselId}-${i}`} className="carousel-item relative w-full">
            <img
              src={`/${folder}/${file}`}
              alt={`${alt} — ${i + 1}/${images.length}`}
              loading="lazy"
              className="aspect-video w-full object-cover"
            />
            {images.length > 1 && (
              <>
                <a
                  href={`#${carouselId}-${(i - 1 + images.length) % images.length}`}
                  aria-label="précédent"
                  className="btn btn-circle btn-sm absolute top-1/2 left-2 -translate-y-1/2 opacity-80"
                >
                  ❮
                </a>
                <a
                  href={`#${carouselId}-${(i + 1) % images.length}`}
                  aria-label="suivant"
                  className="btn btn-circle btn-sm absolute top-1/2 right-2 -translate-y-1/2 opacity-80"
                >
                  ❯
                </a>
              </>
            )}
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {images.map((file, i) => (
            <a
              key={file}
              href={`#${carouselId}-${i}`}
              aria-label={`${i + 1}/${images.length}`}
              className="size-1.5 rounded-full bg-base-content/25 transition-colors hover:bg-primary"
            />
          ))}
        </div>
      )}
    </div>
  )
}
