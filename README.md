# Note! This library is in development / alpha and should not be used in your production projects. It may not even work. Also, you probably want a different carousel like nuka-carousel, anyway.

# react-spring-carousel

A simple carousel component for React using gestures and React Spring.

## Demo

[![Edit Demo on Code Sandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/q0wzzw52w)

## Why another carousel component?

This project has two purposes, both completely self-serving:

1. To meet the exact needs of a slider that I needed for a client project. nuka-carousel was acting buggy in this particular case, and after trouble shooting and trying other components for a while, I decided to build my own.
2. To get practice using React Spring.

That's it. _Really._

Do we need another carousel component? No.
Is this one necessarily better carousel component x? Probably not, but it works on the client project I'm using it for, and it meets my exact specifications.

I do plan on continuing to develop this as need be, and hopefully add some more details on installation/usage, but there are no big plans to maintain this project once my client project is finished.

If you're reading this and for some reason bigger, better carousels don't work for you, then I hope that this little component helps you out!

# How to

## Installation

`yarn add react-spring-carousel`
or 
`npm i -S react-spring-carousel`

## Props

| Prop         | Type    | Default   | Notes                                                                                      |
| ------------ | ------- | --------- | ------------------------------------------------------------------------------------------ |
| infinite     | bool    | true      | Should the carousel have infinite scroll?                                                  |
| rewind       | bool    | false     | Should the carousel rewind to get to the other end                                         |
| slidesToShow | integer | 3         | How many slides should I show?                                                             |
| springConfig | object  | see below | see below                                                                                  |
| centerMode   | bool    | true      | should the selected frame be in the center of the frame (otherwise it will be to the left) |

### Note on infinite and rewind

If infinite and rewind are both false, you will not be able to scroll end-to-end

### Note on springConfig

The carousel uses react-spring. This is the config passed into the Spring element. See their docs for more details 

Default:
```
{
   mass: 1,
   tension: 300,
   friction: 10,
   clamp: true
 }
 ```

## Planned features

- Render props for prev/next buttons
- Render prop for dots

## How do I style...?

Most of it can be done with CSS/SCSS. We use BEM and here are all the classes you might need in a nice heirarchy. Maybe we'll add props down the line! 😮

```
.react-spring-carousel
  .react-spring-carousel__inner
  .react-spring-carousel__slide
    .react-spring-carousel__slide--active 
    .react-spring-carousel__slide--inactive 
    .react-spring-carousel__slide--index-${SLIDENUMBER}
    .react-spring-carousel__slide--next
    .react-spring-carousel__slide--prev
    .react-spring-carousel__slide--clone
  .react-spring-carousel__controls
    .react-spring-carousel__controls__arrow
      .react-spring-carousel__controls__arrow--left 
      .react-spring-carousel__controls__arrow--right 
      .react-spring-carousel__controls__arrow:hover 
    .react-spring-carousel__controls__dots
      .react-spring-carousel__controls__dots__dot
        .react-spring-carousel__controls__dots__dot--active
        .react-spring-carousel__controls__dots__dot:hover

```