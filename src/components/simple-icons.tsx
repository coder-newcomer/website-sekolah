export default function SimpleIcons(props: { iconSlug: string, height?: number, width?: number }) {
  return (
    <img
      height={props.height || 32}
      width={props.width || 32}
      src={`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${props.iconSlug}.svg`}
    />
  )
} 