# Modded Apex Docs

A static documentation site for markdown guides in `docs/`.


## Website
Website is located [here](https://waterycontinent.github.io/ModdedApexDocs/).

## Adding Content
1. Add a new folder depending on the catagory, model, animation etc.
2. Add an .md file with your documentation.
3. If you require downloads/assets provided and/or such, create an asset folder and place your files in there.
4. Run the `scripts/generate_docs_manifest.py` file to update the manifest.
5. Submit a PR to be reviewed.

## Adding Images

Each category can have an `images` folder. For the animation category, use:

```txt
docs/animations/images/
```

Reference an image from a markdown file in that same category like this:

```md
![Short description](example.png)
```

Bare image filenames are resolved through the category's `images` folder, so `example.png` inside `docs/animations/custom-rigs-animations.md` loads `docs/animations/images/example.png`.

You can still use explicit paths when needed, such as `![Preview](../shared/example.png)`.
