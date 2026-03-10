import { useState, useRef } from 'react';
import { Upload, Video, Sparkles, Loader2, Play, Download, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateVeoVideo, pollVideoOperation } from '../services/gemini';

export default function VeoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({
          data: (reader.result as string).split(',')[1],
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt for the video.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setStatus('Initializing generation...');

    try {
      const operation = await generateVeoVideo(prompt, image?.data, image?.mimeType);
      setStatus('Generating video (this may take a few minutes)...');
      
      const url = await pollVideoOperation(operation);
      if (url) {
        setVideoUrl(url);
        setStatus('Generation complete!');
      } else {
        throw new Error('Failed to get video URL');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
            <Video size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Veo AI Video Generator</h3>
            <p className="text-slate-500 text-sm">Create cinematic school highlights from photos and text.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Starting Image (Optional)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  image ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                {image ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={`data:${image.mimeType};base64,${image.data}`} 
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Upload className="text-white" size={24} />
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="text-slate-400 mb-2" size={32} />
                    <p className="text-sm text-slate-500 font-medium">Click to upload photo</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Video Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what should happen in the video... (e.g., 'A cinematic slow-motion shot of students cheering at a graduation ceremony')"
                className="w-full h-32 p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all ${
                isGenerating 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>{status}</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Generate Video</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-8 min-h-[400px]">
            <AnimatePresence mode="wait">
              {videoUrl ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full space-y-4"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
                    <video 
                      src={videoUrl} 
                      controls 
                      autoPlay 
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <a 
                      href={videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center justify-center space-x-2 hover:bg-slate-50 transition-colors"
                    >
                      <Download size={18} />
                      <span>Download</span>
                    </a>
                  </div>
                </motion.div>
              ) : isGenerating ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                      <Video size={32} />
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium">{status}</p>
                  <p className="text-xs text-slate-400 max-w-[200px] mx-auto">
                    AI is processing your request. This typically takes 30-60 seconds.
                  </p>
                </motion.div>
              ) : error ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle size={32} />
                  </div>
                  <p className="text-red-600 font-medium">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="text-sm text-indigo-600 font-bold hover:underline"
                  >
                    Try again
                  </button>
                </motion.div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-white border border-slate-200 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                    <Play size={32} />
                  </div>
                  <p className="text-slate-400 font-medium">Video preview will appear here</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start space-x-4">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Cinematic Quality</h4>
            <p className="text-xs text-slate-500 mt-1">Veo generates high-definition 720p video with consistent motion.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start space-x-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Video size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Image-to-Video</h4>
            <p className="text-xs text-slate-500 mt-1">Upload a photo to use as the starting frame for your animation.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start space-x-4">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <Download size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Instant Sharing</h4>
            <p className="text-xs text-slate-500 mt-1">Download and share highlights on the school's social media.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
