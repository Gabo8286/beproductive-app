import SwiftUI
import BeProductiveUI

struct CaptureView: View {
    @State private var isRecording = false
    @State private var capturedText = ""
    @State private var selectedCaptureType: CaptureType = .voice

    var body: some View {
        NavigationView {
            VStack(spacing: BPSpacing.lg) {
                // Header
                VStack(spacing: BPSpacing.sm) {
                    BPText("Quick Capture", style: .heading1, color: .primary)

                    BPText("Capture your ideas instantly", style: .bodyMedium, color: .secondary)
                }
                .padding(.top, BPSpacing.lg)

                // Capture Type Selector
                CaptureTypePicker(selectedType: $selectedCaptureType)

                Spacer()

                // Main Capture Area
                Group {
                    switch selectedCaptureType {
                    case .voice:
                        VoiceCaptureView(isRecording: $isRecording)
                    case .text:
                        TextCaptureView(text: $capturedText)
                    case .photo:
                        PhotoCaptureView()
                    case .drawing:
                        DrawingCaptureView()
                    }
                }

                Spacer()

                // Quick Actions
                QuickActionsView()
            }
            .padding(.horizontal, BPSpacing.md)
            .navigationTitle("Capture")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItemGroup(placement: .navigationBarTrailing) {
                    Button(action: { /* Settings */ }) {
                        Image(systemName: "gear")
                    }
                    
                    Button(action: { /* Notifications */ }) {
                        Image(systemName: "bell")
                    }
                }
            }
        }
    }
}

struct CaptureTypePicker: View {
    @Binding var selectedType: CaptureType

    var body: some View {
        HStack(spacing: BPSpacing.sm) {
            ForEach(CaptureType.allCases, id: \.self) { type in
                BPButton(
                    type.title,
                    icon: type.iconName,
                    style: selectedType == type ? .primary : .secondary,
                    size: .medium
                ) {
                    selectedType = type
                }
            }
        }
        .bpCard()
        .padding(.horizontal, BPSpacing.md)
    }
}

struct VoiceCaptureView: View {
    @Binding var isRecording: Bool

    var body: some View {
        VStack(spacing: BPSpacing.lg) {
            // Recording Animation
            ZStack {
                Circle()
                    .fill(BPColors.Primary.main.opacity(0.1))
                    .frame(width: 200, height: 200)

                Circle()
                    .fill(BPColors.Primary.main.opacity(0.2))
                    .frame(width: 160, height: 160)
                    .scaleEffect(isRecording ? 1.2 : 1.0)
                    .animation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true), value: isRecording)

                Circle()
                    .fill(BPColors.Primary.main)
                    .frame(width: 120, height: 120)

                Image(systemName: isRecording ? "stop.fill" : "mic.fill")
                    .font(.system(size: 40))
                    .foregroundColor(.white)
            }

            // Recording Status
            BPText(
                isRecording ? "Recording..." : "Tap to start recording",
                style: .bodyLarge,
                color: .secondary
            )

            // Record Button
            BPButton(
                isRecording ? "Stop Recording" : "Start Recording",
                icon: isRecording ? "stop.fill" : "mic.fill",
                style: .primary,
                size: .large
            ) {
                isRecording.toggle()
            }
        }
        .bpCard()
    }
}

struct TextCaptureView: View {
    @Binding var text: String

    var body: some View {
        VStack(spacing: BPSpacing.md) {
            BPTextField(
                placeholder: "Type your thoughts here...",
                text: $text,
                inputType: .multiline(minLines: 3, maxLines: 8)
            )
            .frame(minHeight: 200)

            HStack {
                BPButton(
                    "Clear",
                    style: .secondary,
                    size: .medium
                ) {
                    text = ""
                }

                Spacer()

                BPButton(
                    "Save",
                    style: .primary,
                    size: .medium
                ) {
                    // Save text
                }
            }
        }
        .bpCard()
    }
}

struct PhotoCaptureView: View {
    var body: some View {
        VStack(spacing: BPSpacing.lg) {
            Image(systemName: "camera.fill")
                .font(.system(size: 60))
                .foregroundColor(BPColors.Primary.main)

            BPText("Photo Capture", style: .heading3, color: .primary)

            BPText("Take a photo to capture visual information", style: .bodyMedium, color: .secondary)
                .multilineTextAlignment(.center)

            BPButton(
                "Open Camera",
                icon: "camera.fill",
                style: .primary,
                size: .large
            ) {
                // Open camera
            }
        }
        .bpCard()
    }
}

struct DrawingCaptureView: View {
    var body: some View {
        VStack(spacing: BPSpacing.lg) {
            Image(systemName: "pencil.and.outline")
                .font(.system(size: 60))
                .foregroundColor(BPColors.Primary.main)

            BPText("Drawing Capture", style: .heading3, color: .primary)

            BPText("Sketch your ideas with digital drawing", style: .bodyMedium, color: .secondary)
                .multilineTextAlignment(.center)

            BPButton(
                "Start Drawing",
                icon: "pencil.and.outline",
                style: .primary,
                size: .large
            ) {
                // Start drawing
            }
        }
        .bpCard()
    }
}

struct QuickActionsView: View {
    var body: some View {
        VStack(spacing: BPSpacing.md) {
            BPText("Quick Actions", style: .heading4, color: .primary)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: BPSpacing.sm) {
                QuickActionButton(title: "New Task", icon: "checkmark.circle", color: BPColors.Success.main)
                QuickActionButton(title: "New Goal", icon: "target", color: BPColors.Primary.main)
                QuickActionButton(title: "New Note", icon: "note.text", color: BPColors.Warning.main)
                QuickActionButton(title: "New Project", icon: "folder.badge.plus", color: BPColors.Secondary.main)
            }
        }
        .bpCard()
    }
}

struct QuickActionButton: View {
    let title: String
    let icon: String
    let color: Color

    var body: some View {
        Button(action: {
            // Handle quick action
        }) {
            VStack(spacing: BPSpacing.xs) {
                Image(systemName: icon)
                    .font(.system(size: 24))
                    .foregroundColor(color)

                BPText(title, style: .labelMedium, color: .primary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, BPSpacing.md)
            .background(color.opacity(0.1))
            .cornerRadius(BPSpacing.sm)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

enum CaptureType: String, CaseIterable {
    case voice = "voice"
    case text = "text"
    case photo = "photo"
    case drawing = "drawing"

    var title: String {
        switch self {
        case .voice: return "Voice"
        case .text: return "Text"
        case .photo: return "Photo"
        case .drawing: return "Drawing"
        }
    }

    var iconName: String {
        switch self {
        case .voice: return "mic.fill"
        case .text: return "text.cursor"
        case .photo: return "camera.fill"
        case .drawing: return "pencil.and.outline"
        }
    }
}

#Preview {
    CaptureView()
        .environmentObject(BPThemeManager.shared)
}