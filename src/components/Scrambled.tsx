import { useScramble } from '../hooks/useScramble'

/** Texte qui se « déchiffre » à l’apparition. */
export function Scrambled({
  text,
  active,
  delay = 0,
  className,
  as: Tag = 'span',
}: {
  text: string
  active: boolean
  delay?: number
  className?: string
  as?: 'span' | 'h2' | 'h3' | 'p' | 'div'
}) {
  const value = useScramble(text, active, delay)
  return <Tag className={className}>{value || ' '}</Tag>
}
