import * as fs from 'fs';
import * as fse from "fs-extra";
import * as path from 'path';
import axios from 'axios';

interface ImageResource {
  value: string;
  name: string;
  fileName: string
  type: 'url' | 'base64';
}


export class ResourceCollector {
  private resources: Map<string, ImageResource> = new Map();
  private resourceIndex: number = 0;

  private isImageUrl(str: string): boolean {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|ico|bmp|tiff|avif)$/i;
    return typeof str === 'string' &&
      (str.startsWith('http://') || str.startsWith('https://')) &&
      imageExtensions.test(str);
  }

  private isBase64Image(str: string): boolean {
    return typeof str === 'string' &&
      str.startsWith('data:image/') &&
      str.includes('base64,');
  }

  private matchCssUrlImage(str: string): string | null {
    // 匹配 url(...) 格式
    const urlRegex = /^url\(['"]?(.*?)['"]?\)$/;
    if (typeof str === 'string' && urlRegex.test(str)) {
      // 提取 url(...) 中的实际 URL
      const match = str.match(urlRegex);
      if (match && match[1] && this.isImageUrl(match[1])) {
        return match[1];
      }
    }
    return null;
  }

  private collectResource(name: string, value: string): string {
    if (!this.resources.has(value)) {
      this.resources.set(value, {
        value: value,
        name: name,
        fileName: `${name}${this.isImageUrl(value) ? path.extname(value).split('?')[0] : '.png'}`,
        type: this.isImageUrl(value) ? 'url' : 'base64'
      });
    }
    return name;
  }

  private findImageInObject(obj: any, callback?: any): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        const value = obj[key];
        if (this.isImageUrl(value) || this.isBase64Image(value)) {
          callback(obj, key, value)
        } else if (this.matchCssUrlImage(value)) {
          const imageUrl = this.matchCssUrlImage(value);
          callback(obj, key, imageUrl)
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.findImageInObject(obj[key], callback);
      }
    }
  }

  collectByToJson(toJson: any): void {
    if (!Array.isArray(toJson?.scenes)) {
      return
    }

    toJson.scenes.forEach((scene: any) => {
      if (scene.coms) {
        Object.keys(scene.coms).forEach((comKey: any) => {
          const com = scene.coms[comKey]
          if (com.model?.data) {
            this.findImageInObject(com.model.data, (obj: any, key: string, value: string) => {
              const name = this.collectResource(`img_${com.id}`, value);
              obj[key] = `$r('app.media.${name}')`

              console.log('obj[key]', obj[key])
            })
          }

          if (com.model?.style?.styleAry) {
            this.findImageInObject(com.model.style.styleAry, (obj: any, key: string, value: string) => {
              const name = this.collectResource(`img_style_${com.id}`, value);
              obj[key] = `$r('app.media.${name}')`

              console.log('obj[key]', obj[key])
            })
          }
        })
      }
    })

  }

  async outputToResources(appFolder: string): Promise<void> {
    const mediaPath = path.join(appFolder, 'src', 'main', 'resources', 'base', 'media');

    await fse.ensureDir(mediaPath)

    // 在方法内创建缓存 Map
    const urlCache = new Map<string, Promise<Buffer>>();

    const fetchUrl = async (url: string): Promise<Buffer> => {
      if (!urlCache.has(url)) {
        urlCache.set(url,
          axios.get(url, { responseType: 'arraybuffer' })
            .then(response => Buffer.from(response.data))
        );
      }
      return urlCache.get(url)!;
    };

    for (const [original, resource] of this.resources) {
      try {
        let data: Buffer;
        if (resource.type === 'url') {
          data = await fetchUrl(original);
        } else {
          const base64Data = original.split(',')[1];
          data = Buffer.from(base64Data, 'base64');
        }

        const filePath = path.join(mediaPath, resource.fileName);
        await fse.writeFile(filePath, data);
      } catch (error) {
        console.error(`Failed to process resource: ${original}`, error);
      }
    }
  }
}