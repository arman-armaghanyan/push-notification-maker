export const sampleSvgShapes = [
  {
    id: 1,
    name: 'bell',
    tags: ['bell', 'notification', 'alert', 'ring'],
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C10.9 2 10 2.9 10 4C10 4.1 10 4.2 10 4.3C7.2 5.2 5 7.9 5 11V17L3 19V20H21V19L19 17V11C19 7.9 16.8 5.2 14 4.3C14 4.2 14 4.1 14 4C14 2.9 13.1 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z"/>
    </svg>`
  },
  {
    id: 2,
    name: 'heart',
    tags: ['heart', 'love', 'like', 'favorite'],
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/>
    </svg>`
  },
  {
    id: 3,
    name: 'star',
    tags: ['star', 'favorite', 'rating', 'bookmark'],
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.09 8.26L20.78 9.27L16.39 13.55L17.51 20.21L12 16.89L6.49 20.21L7.61 13.55L3.22 9.27L9.91 8.26L12 2Z"/>
    </svg>`
  },
  {
    id: 4,
    name: 'message',
    tags: ['message', 'chat', 'comment', 'bubble'],
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H18L22 22V4C22 2.9 21.1 2 20 2ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z"/>
    </svg>`
  },
  {
    id: 5,
    name: 'lightning',
    tags: ['lightning', 'flash', 'bolt', 'power', 'energy'],
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/>
    </svg>`
  },
  {
    id: 6,
    name: 'gift',
    tags: ['gift', 'present', 'box', 'surprise'],
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 7H16.5L17.08 5.07C17.34 4.17 16.84 3.23 15.94 2.97C15.04 2.71 14.1 3.21 13.84 4.11L12.93 7H11.07L10.16 4.11C9.9 3.21 8.96 2.71 8.06 2.97C7.16 3.23 6.66 4.17 6.92 5.07L7.5 7H4C3.45 7 3 7.45 3 8S3.45 9 4 9H5V20C5 20.55 5.45 21 6 21H18C18.55 21 19 20.55 19 20V9H20C20.55 9 21 8.55 21 8S20.55 7 20 7ZM13 19H11V9H13V19Z"/>
    </svg>`
  },
  {
    id: 7,
    name: 'shopping-cart',
    tags: ['shopping', 'cart', 'buy', 'purchase', 'store'],
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 18C5.9 18 5 18.9 5 20S5.9 22 7 22 9 21.1 9 20 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15 18.9 15 20S15.9 22 17 22 19 21.1 19 20 18.1 18 17 18Z"/>
    </svg>`
  },
  {
    id: 8,
    name: 'trophy',
    tags: ['trophy', 'award', 'winner', 'achievement', 'prize'],
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.2 2H19.5C19.2 2 19 2.2 19 2.5V3H5V2.5C5 2.2 4.8 2 4.5 2H3.8C2.8 2 2 2.8 2 3.8V5.3C2 7.2 3.5 8.7 5.4 8.9C5.9 10.6 7.1 12 8.7 12.7C9.1 14.5 10.7 15.9 12.6 15.9C12.8 15.9 13 16.1 13 16.3V19H10C9.4 19 9 19.4 9 20V21C9 21.6 9.4 22 10 22H14C14.6 22 15 21.6 15 21V20C15 19.4 14.6 19 14 19H13V16.3C13 16.1 13.2 15.9 13.4 15.9C15.3 15.9 16.9 14.5 17.3 12.7C18.9 12 20.1 10.6 20.6 8.9C22.5 8.7 24 7.2 24 5.3V3.8C24 2.8 23.2 2 22.2 2H20.2Z"/>
    </svg>`
  },
  {
    id: 9,
    name: 'fire',
    tags: ['fire', 'flame', 'hot', 'trending', 'popular'],
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.5 0.67C13.5 0.67 14.09 3.29 12.7 5.29C11.3 7.29 9.84 7.05 9.84 7.05C9.84 7.05 9.38 4.38 10.78 2.39C12.17 0.39 13.5 0.67 13.5 0.67ZM19.88 6.89C19.88 6.89 18.3 4.69 16.9 4.69C15.5 4.69 14.38 5.19 14.38 5.19C14.38 5.19 16.38 6.59 16.38 9.09C16.38 11.59 13.08 12.79 13.08 12.79C13.08 12.79 15.38 14.5 15.38 17.39C15.38 20.29 13.08 21.39 13.08 21.39C13.08 21.39 18.68 19.39 18.68 13.79C18.68 8.19 19.88 6.89 19.88 6.89ZM8.21 16.29C8.21 16.29 8.41 12.09 5.21 10.79C2 9.5 0.8 11 0.8 11C0.8 11 2.5 13.39 2.5 16.79C2.5 20.19 3 22.39 7.91 22.39C12.81 22.39 13.21 19.29 13.21 19.29C13.21 19.29 10.41 19.29 9.21 18.39C8 17.5 8.21 16.29 8.21 16.29Z"/>
    </svg>`
  },
  {
    id: 10,
    name: 'flag',
    tags: ['flag', 'banner', 'milestone', 'goal'],
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.4 6L14 4H5V21H7V14H12.6L13 16H20V6H14.4Z"/>
    </svg>`
  },
  {
    id: 11,
    name: 'warning',
    tags: ['warning', 'alert', 'caution', 'exclamation'],
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z"/>
    </svg>`
  },
  {
    id: 12,
    name: 'info',
    tags: ['info', 'information', 'help', 'question'],
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"/>
    </svg>`
  }
];
