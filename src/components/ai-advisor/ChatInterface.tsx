import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import georgeAvatar from "@/assets/george-avatar.png";
import peppaAvatar from "@/assets/peppa-avatar.png";
import { Send, Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  character: 'george' | 'peppa';
}

export default function ChatInterface({ character }: ChatInterfaceProps) {
  const { chatHistory, sendMessage } = useAIAdvisor();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const avatar = character === 'george' ? georgeAvatar : peppaAvatar;
  const characterName = character === 'george' ? 'George' : 'Peppa';
  const characterColor = character === 'george' ? 'blue' : 'red';

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    const userMessage = message;
    setMessage('');
    setSending(true);

    await sendMessage(userMessage);
    setSending(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <Card className={`border-2 border-${characterColor}-500/20`}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full overflow-hidden bg-${characterColor}-100 border-2 border-${characterColor}-500`}>
            <img src={avatar} alt={characterName} className="w-full h-full object-cover" />
          </div>
          <CardTitle>Chat with {characterName}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4 mb-4" ref={scrollRef}>
          <div className="space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>Ask {characterName} anything about your finances!</p>
                <p className="text-sm mt-2">Try: "How am I doing with my budget?" or "Tips for saving more?"</p>
              </div>
            )}
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className={`w-8 h-8 rounded-full overflow-hidden bg-${characterColor}-100 border-2 border-${characterColor}-500 flex-shrink-0`}>
                    <img src={avatar} alt={characterName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-full overflow-hidden bg-${characterColor}-100 border-2 border-${characterColor}-500 flex-shrink-0`}>
                  <img src={avatar} alt={characterName} className="w-full h-full object-cover" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask ${characterName} for advice...`}
            disabled={sending}
          />
          <Button onClick={handleSend} disabled={sending || !message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}