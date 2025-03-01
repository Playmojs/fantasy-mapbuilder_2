# Fantasy Mapbuilder

Welcome to Fantasy Mapbuilder, a web-app created to make world-building in fantasy more intuitive and cooperative. The goal of this page is to let people upload their maps and world-information into an organized project, where reading, comparing and fetching data is as easy as possible.
 
Today, creating fantasy worlds is an increasingly social and cooperative hobby, and this page allows many users to cooperate on single worlds and projects, and read-access to other worlds for inspiration.

The webpage is currently hosted at https://fantasy-mapbuilder.netlify.app/ - feel free to check it out!

## Frameworks and external tools

### Svelte 5

This project would not be possible without a series of tools made for us. The web-app runs more or less entirely in the browser, developed using [Svelte 5](https://svelte.dev/), a web framework that has proven intutitive even for primarily non-web developers such as myself.

### Supabase

The fantasy worlds are currenly stored by a free-version of [Supabase](https://supabase.com/), which provides both user authorization and security, databases for project-information and file buckets for images.

### Netlify

We are currently deploying using [netlify](https://www.netlify.com/). This has made deployment stream-lined, and we are pleased with how simple it made getting this webpage out into the world.

## Planned updates

Working on this web-app is a continuous project. It is currently in a state where we feel it really adds something to our fantasy world, in terms of visualization and connecting.

Working on improving the design is of high priority, both to make it more accessible on phones and other devices, as well as making the interfaces intuitive and appealing.

We are also considering moving to some kind of self-hosting, primarily to make the website faster and to lift the database / file-size limits with supabase's free plan.

## Developing

After cloning the repo, run:

```bash
npm install
```
to install the necessary packages. The webpage can be deployed locally with.

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Deployment

Although Netlify does automatic redeployment on git pushes, we have run into mysterious problems where this deployment pipeline produces 500 errors. Instead, to deploy to Netlify, install the netlify client and run 

```bash
netlify build

netlify deploy --prod
```

to update netlify's production. This requires that netlify recognizes you as a contributor to the project.
