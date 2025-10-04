import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { getContrastRatio, meetsWCAGStandard } from "@/lib/color-system";

interface ContrastResult {
  ratio: number;
  aa: boolean;
  aaa: boolean;
  aaLarge: boolean;
  aaaLarge: boolean;
}

export const ContrastChecker: React.FC = () => {
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [result, setResult] = useState<ContrastResult | null>(null);

  useEffect(() => {
    const ratio = getContrastRatio(foreground, background);

    setResult({
      ratio,
      aa: meetsWCAGStandard(foreground, background, "AA", false),
      aaa: meetsWCAGStandard(foreground, background, "AAA", false),
      aaLarge: meetsWCAGStandard(foreground, background, "AA", true),
      aaaLarge: meetsWCAGStandard(foreground, background, "AAA", true),
    });
  }, [foreground, background]);

  const getStatusIcon = (passes: boolean) => {
    return passes ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (passes: boolean, label: string) => {
    return (
      <Badge
        variant={passes ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {getStatusIcon(passes)}
        {label}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          WCAG Contrast Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="foreground">Foreground Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="foreground"
                type="color"
                value={foreground}
                onChange={(e) => setForeground(e.target.value)}
                className="w-16 h-10 p-1 rounded"
              />
              <Input
                type="text"
                value={foreground}
                onChange={(e) => setForeground(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Background Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="background"
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-16 h-10 p-1 rounded"
              />
              <Input
                type="text"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="font-semibold">Preview</h3>
          <div
            className="p-6 rounded-lg border"
            style={{ backgroundColor: background, color: foreground }}
          >
            <p className="text-lg font-medium mb-2">Sample heading text</p>
            <p className="text-base mb-2">
              This is regular body text used to test readability and contrast.
            </p>
            <p className="text-sm">
              This is small text that should still be readable.
            </p>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Contrast Ratio</h3>
              <span className="text-2xl font-bold">
                {result.ratio.toFixed(2)}:1
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Normal Text</h4>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(result.aa, "WCAG AA (4.5:1)")}
                  {getStatusBadge(result.aaa, "WCAG AAA (7:1)")}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Large Text</h4>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(result.aaLarge, "WCAG AA (3:1)")}
                  {getStatusBadge(result.aaaLarge, "WCAG AAA (4.5:1)")}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Recommendations</h4>
              {result.aaa ? (
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✅ Excellent! This color combination meets the highest
                  accessibility standards.
                </p>
              ) : result.aa ? (
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ✅ Good! This combination meets WCAG AA standards but could be
                  improved for AAA compliance.
                </p>
              ) : (
                <p className="text-sm text-red-700 dark:text-red-300">
                  ❌ This combination does not meet accessibility standards.
                  Consider using darker text or a lighter background.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Hook for contrast checking in components
export const useContrastChecker = () => {
  const checkContrast = (fg: string, bg: string) => {
    return {
      ratio: getContrastRatio(fg, bg),
      isAccessible: meetsWCAGStandard(fg, bg, "AA"),
      isHighContrast: meetsWCAGStandard(fg, bg, "AAA"),
    };
  };

  return { checkContrast };
};
