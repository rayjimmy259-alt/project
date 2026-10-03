import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface ProductReview {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          aria-hidden="true"
          className={`h-4 w-4 ${star <= rating ? "text-warning-400" : "text-ink-700"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError(null);

    if (!supabase) {
      setLoadError("Las reseñas no están disponibles porque Supabase no está configurado.");
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    void (async () => {
      try {
        const { data, error } = await supabase
          .from("product_reviews")
          .select("id, user_name, rating, comment, created_at")
          .eq("product_id", productId)
          .order("created_at", { ascending: false });

        if (!active) return;
        if (error) {
          setLoadError(`No se pudieron cargar las reseñas: ${error.message}`);
          return;
        }
        setReviews((data ?? []) as ProductReview[]);
      } catch (error) {
        if (!active) return;
        const detail = error instanceof Error ? error.message : String(error);
        setLoadError(`No se pudieron cargar las reseñas: ${detail}`);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [productId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const trimmedName = userName.trim();
    const trimmedComment = comment.trim();
    if (trimmedName.length < 2 || trimmedName.length > 60) {
      setFormError("El nombre debe tener entre 2 y 60 caracteres.");
      return;
    }
    if (trimmedComment.length < 10 || trimmedComment.length > 1000) {
      setFormError("La opinión debe tener entre 10 y 1000 caracteres.");
      return;
    }
    if (!supabase) {
      setFormError("No se pudo enviar la reseña porque Supabase no está configurado.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .insert({
          product_id: productId,
          user_name: trimmedName,
          rating,
          comment: trimmedComment,
        })
        .select("id, user_name, rating, comment, created_at")
        .single();

      if (error) {
        setFormError(`No se pudo publicar la reseña: ${error.message}`);
        return;
      }

      setReviews((current) => [data as ProductReview, ...current]);
      setUserName("");
      setComment("");
      setRating(5);
      setSuccessMessage("¡Gracias! Tu reseña se publicó correctamente.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setFormError(`No se pudo publicar la reseña: ${detail}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mt-12" aria-labelledby="product-reviews-title">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="product-reviews-title" className="text-2xl font-bold text-ink-50">
            Reseñas de visitantes
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            Comparte tu experiencia con este producto.
          </p>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <ReviewStars rating={Math.round(averageRating)} />
            <span className="text-sm font-semibold text-ink-100">
              {averageRating.toFixed(1)} ({reviews.length})
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <div className="space-y-3">
          {isLoading ? (
            <p className="card p-5 text-sm text-ink-400">Cargando reseñas…</p>
          ) : loadError ? (
            <p role="alert" className="card p-5 text-sm text-error-400">{loadError}</p>
          ) : reviews.length === 0 ? (
            <p className="card p-5 text-sm text-ink-400">
              Aún no hay reseñas. Sé la primera persona en opinar.
            </p>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-ink-100">{review.user_name}</h3>
                  <time
                    className="text-xs text-ink-500"
                    dateTime={review.created_at}
                  >
                    {new Date(review.created_at).toLocaleDateString()}
                  </time>
                </div>
                <div className="mt-2"><ReviewStars rating={review.rating} /></div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-300">
                  {review.comment}
                </p>
              </article>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-5">
          <h3 className="text-lg font-semibold text-ink-50">Deja tu reseña</h3>
          <div>
            <span id="review-rating-label" className="mb-2 block text-sm font-medium text-ink-200">
              Tu calificación
            </span>
            <div
              className="flex items-center gap-1"
              role="group"
              aria-labelledby="review-rating-label"
              onMouseLeave={() => setHoveredRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onFocus={() => setHoveredRating(star)}
                  onBlur={() => setHoveredRating(0)}
                  aria-label={`${star} ${star === 1 ? "estrella" : "estrellas"}`}
                  aria-pressed={rating === star}
                  className={`rounded p-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning-400 ${star <= (hoveredRating || rating) ? "text-warning-400" : "text-ink-600"}`}
                >
                  <svg aria-hidden="true" className="h-9 w-9" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-sm text-ink-300" aria-live="polite">
                {rating}/5
              </span>
            </div>
          </div>

          <label className="block text-sm font-medium text-ink-200">
            Nombre
            <input
              required
              minLength={2}
              maxLength={60}
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm text-ink-100 outline-none focus:border-primary-500"
              autoComplete="name"
            />
          </label>

          <label className="block text-sm font-medium text-ink-200">
            Tu opinión
            <textarea
              required
              minLength={10}
              maxLength={1000}
              rows={5}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="mt-1.5 w-full resize-y rounded-lg border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm text-ink-100 outline-none focus:border-primary-500"
            />
            <span className="mt-1 block text-right text-xs text-ink-500">
              {comment.length}/1000
            </span>
          </label>

          {formError && <p role="alert" className="text-sm text-error-400">{formError}</p>}
          {successMessage && <p role="status" className="text-sm text-success-400">{successMessage}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Publicando…" : "Publicar reseña"}
          </button>
          <p className="text-xs text-ink-500">
            Las reseñas son públicas y se mostrarán con el nombre que ingreses.
          </p>
        </form>
      </div>
    </section>
  );
}
