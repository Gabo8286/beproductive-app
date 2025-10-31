import SwiftUI

/// BeProductive Text Field Component
///
/// A comprehensive text field component that provides consistent styling, validation,
/// accessibility compliance, and various input types for the BeProductive application.
@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
public struct BPTextField: View {

    // MARK: - Properties

    private let title: String?
    private let placeholder: String
    private let helperText: String?
    private let errorText: String?
    private let style: TextFieldStyle
    private let size: TextFieldSize
    private let inputType: InputType
    private let isRequired: Bool
    private let isDisabled: Bool
    private let leadingIcon: String?
    private let trailingIcon: String?
    private let maxLength: Int?
    private let onTrailingIconTap: (() -> Void)?

    @Binding private var text: String
    @State private var isEditing = false
    @State private var isFocused = false
    @FocusState private var fieldIsFocused: Bool

    @Environment(\.bpTheme) private var theme

    // MARK: - Text Field Styles

    public enum TextFieldStyle: CaseIterable {
        case standard
        case outlined
        case filled
        case underlined
        case borderless

        var description: String {
            switch self {
            case .standard: return "Standard"
            case .outlined: return "Outlined"
            case .filled: return "Filled"
            case .underlined: return "Underlined"
            case .borderless: return "Borderless"
            }
        }
    }

    // MARK: - Text Field Sizes

    public enum TextFieldSize: CaseIterable {
        case small
        case medium
        case large

        var description: String {
            switch self {
            case .small: return "Small"
            case .medium: return "Medium"
            case .large: return "Large"
            }
        }
    }

    // MARK: - Input Types

    public enum InputType {
        case text
        case email
        case password
        case phone
        case number
        case decimal
        case url
        case search
        case multiline(minLines: Int = 3, maxLines: Int = 5)

        var keyboardType: UIKeyboardType {
            switch self {
            case .text, .password, .multiline:
                return .default
            case .email:
                return .emailAddress
            case .phone:
                return .phonePad
            case .number:
                return .numberPad
            case .decimal:
                return .decimalPad
            case .url:
                return .URL
            case .search:
                return .webSearch
            }
        }

        var textContentType: UITextContentType? {
            switch self {
            case .email:
                return .emailAddress
            case .password:
                return .password
            case .phone:
                return .telephoneNumber
            case .url:
                return .URL
            default:
                return nil
            }
        }

        var isSecure: Bool {
            if case .password = self { return true }
            return false
        }

        var isMultiline: Bool {
            if case .multiline = self { return true }
            return false
        }
    }

    // MARK: - Initializer

    public init(
        title: String? = nil,
        placeholder: String,
        text: Binding<String>,
        helperText: String? = nil,
        errorText: String? = nil,
        style: TextFieldStyle = .outlined,
        size: TextFieldSize = .medium,
        inputType: InputType = .text,
        isRequired: Bool = false,
        isDisabled: Bool = false,
        leadingIcon: String? = nil,
        trailingIcon: String? = nil,
        maxLength: Int? = nil,
        onTrailingIconTap: (() -> Void)? = nil
    ) {
        self.title = title
        self.placeholder = placeholder
        self._text = text
        self.helperText = helperText
        self.errorText = errorText
        self.style = style
        self.size = size
        self.inputType = inputType
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.leadingIcon = leadingIcon
        self.trailingIcon = trailingIcon
        self.maxLength = maxLength
        self.onTrailingIconTap = onTrailingIconTap
    }

    // MARK: - Body

    public var body: some View {
        VStack(alignment: .leading, spacing: theme.spacing.xs) {
            // Title
            if let title = title {
                titleView(title)
            }

            // Input field
            inputField

            // Helper or error text
            if let errorText = errorText {
                errorView(errorText)
            } else if let helperText = helperText {
                helperView(helperText)
            }
        }
        .animation(Animation.easeInOut(duration: theme.animations.fast), value: hasError)
        .animation(Animation.easeInOut(duration: theme.animations.fast), value: isFocused)
    }

    // MARK: - Title View

    private func titleView(_ title: String) -> some View {
        HStack(spacing: theme.spacing.xs) {
            BPText(title, style: .labelMedium, color: .secondary)

            if isRequired {
                BPText("*", style: .labelMedium, color: .error)
            }

            Spacer()
        }
    }

    // MARK: - Input Field

    @ViewBuilder
    private var inputField: some View {
        HStack(spacing: theme.spacing.sm) {
            // Leading icon
            if let leadingIcon = leadingIcon {
                Image(systemName: leadingIcon)
                    .font(iconFont)
                    .foregroundColor(iconColor)
            }

            // Text input
            if inputType.isMultiline {
                multilineTextEditor
            } else if inputType.isSecure {
                secureField
            } else {
                textField
            }

            // Trailing icon
            if let trailingIcon = trailingIcon {
                Button(action: {
                    onTrailingIconTap?()
                }) {
                    Image(systemName: trailingIcon)
                        .font(iconFont)
                        .foregroundColor(iconColor)
                }
                .disabled(onTrailingIconTap == nil)
            }
        }
        .padding(.horizontal, horizontalPadding)
        .padding(.vertical, verticalPadding)
        .background(backgroundColor)
        .overlay(borderOverlay)
        .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
        .disabled(isDisabled)
        .onChange(of: fieldIsFocused) {
            withAnimation(Animation.easeInOut(duration: theme.animations.fast)) {
                isFocused = fieldIsFocused
            }
        }
    }

    // MARK: - Input Components

    private var textField: some View {
        TextField(placeholder, text: $text)
            .textFieldStyle(PlainTextFieldStyle())
            .font(textFont)
            .foregroundColor(textColor)
            .keyboardType(inputType.keyboardType)
            .textContentType(inputType.textContentType)
            .autocapitalization(autocapitalization)
            .disableAutocorrection(shouldDisableAutocorrection)
            .focused($fieldIsFocused)
            .onChange(of: text) {
                if let maxLength = maxLength, text.count > maxLength {
                    text = String(text.prefix(maxLength))
                }
            }
    }

    private var secureField: some View {
        SecureField(placeholder, text: $text)
            .textFieldStyle(PlainTextFieldStyle())
            .font(textFont)
            .foregroundColor(textColor)
            .textContentType(inputType.textContentType)
            .focused($fieldIsFocused)
            .onChange(of: text) {
                if let maxLength = maxLength, text.count > maxLength {
                    text = String(text.prefix(maxLength))
                }
            }
    }

    @ViewBuilder
    private var multilineTextEditor: some View {
        if case .multiline(let minLines, let maxLines) = inputType {
            TextEditor(text: $text)
                .font(textFont)
                .foregroundColor(textColor)
                .frame(minHeight: CGFloat(minLines) * lineHeight, maxHeight: CGFloat(maxLines) * lineHeight)
                .focused($fieldIsFocused)
                .scrollContentBackground(.hidden)
                .onChange(of: text) {
                    if let maxLength = maxLength, text.count > maxLength {
                        text = String(text.prefix(maxLength))
                    }
                }
        }
    }

    // MARK: - Helper Views

    private func helperView(_ text: String) -> some View {
        HStack {
            BPText(text, style: .captionMedium, color: .tertiary)
            Spacer()
            if let maxLength = maxLength {
                BPText("\(self.text.count)/\(maxLength)", style: .captionSmall, color: .tertiary)
            }
        }
    }

    private func errorView(_ text: String) -> some View {
        HStack {
            Image(systemName: "exclamationmark.circle.fill")
                .font(.caption)
                .foregroundColor(theme.colors.error.main)

            BPText(text, style: .captionMedium, color: .error)

            Spacer()
        }
    }

    // MARK: - Style Computations

    private var hasError: Bool {
        return errorText != nil
    }

    private var backgroundColor: Color {
        if isDisabled {
            return theme.colors.background.secondary.opacity(0.5)
        }

        switch style {
        case .standard, .outlined, .underlined, .borderless:
            return theme.colors.background.primary
        case .filled:
            return theme.colors.background.secondary
        }
    }

    private var textColor: Color {
        if isDisabled {
            return theme.colors.text.disabled
        }
        return theme.colors.text.primary
    }

    private var iconColor: Color {
        if isDisabled {
            return theme.colors.text.disabled
        }
        if hasError {
            return theme.colors.error.main
        }
        if isFocused {
            return theme.colors.primary.main
        }
        return theme.colors.text.tertiary
    }

    private var textFont: Font {
        let baseStyle = theme.typography.semantic.placeholder
        let scaledStyle = theme.typography.scaled(baseStyle)

        switch size {
        case .small:
            return Font.system(size: scaledStyle.size * 0.9, weight: scaledStyle.weight.weight, design: scaledStyle.family.font)
        case .medium:
            return scaledStyle.font
        case .large:
            return Font.system(size: scaledStyle.size * 1.1, weight: scaledStyle.weight.weight, design: scaledStyle.family.font)
        }
    }

    private var iconFont: Font {
        switch size {
        case .small:
            return .caption
        case .medium:
            return .callout
        case .large:
            return .body
        }
    }

    private var horizontalPadding: CGFloat {
        switch size {
        case .small:
            return theme.spacing.sm
        case .medium:
            return theme.spacing.md
        case .large:
            return theme.spacing.lg
        }
    }

    private var verticalPadding: CGFloat {
        switch size {
        case .small:
            return theme.spacing.xs
        case .medium:
            return theme.spacing.sm
        case .large:
            return theme.spacing.md
        }
    }

    private var cornerRadius: CGFloat {
        switch style {
        case .standard, .outlined, .filled:
            return theme.borders.defaultRadius
        case .underlined, .borderless:
            return 0
        }
    }

    private var lineHeight: CGFloat {
        switch size {
        case .small:
            return 20
        case .medium:
            return 24
        case .large:
            return 28
        }
    }

    @ViewBuilder
    private var borderOverlay: some View {
        switch style {
        case .outlined:
            RoundedRectangle(cornerRadius: cornerRadius)
                .stroke(borderColor, lineWidth: borderWidth)
        case .underlined:
            VStack {
                Spacer()
                Rectangle()
                    .fill(borderColor)
                    .frame(height: borderWidth)
            }
        case .standard, .filled, .borderless:
            EmptyView()
        }
    }

    private var borderColor: Color {
        if hasError {
            return theme.colors.error.main
        }
        if isFocused {
            return theme.colors.primary.main
        }
        return theme.colors.border.default
    }

    private var borderWidth: CGFloat {
        if hasError || isFocused {
            return theme.borders.focusWidth
        }
        return theme.borders.defaultWidth
    }

    // MARK: - Input Behavior

    private var autocapitalization: UITextAutocapitalizationType {
        switch inputType {
        case .email, .url, .password:
            return .none
        case .text, .search:
            return .sentences
        default:
            return .none
        }
    }

    private var shouldDisableAutocorrection: Bool {
        switch inputType {
        case .email, .url, .password, .phone, .number, .decimal:
            return true
        default:
            return false
        }
    }
}

// MARK: - Convenience Initializers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
extension BPTextField {

    /// Create an email text field
    public static func email(
        title: String? = nil,
        placeholder: String = "Email",
        text: Binding<String>,
        helperText: String? = nil,
        errorText: String? = nil,
        isRequired: Bool = false
    ) -> BPTextField {
        return BPTextField(
            title: title,
            placeholder: placeholder,
            text: text,
            helperText: helperText,
            errorText: errorText,
            inputType: .email,
            isRequired: isRequired,
            leadingIcon: "envelope"
        )
    }

    /// Create a password text field
    public static func password(
        title: String? = nil,
        placeholder: String = "Password",
        text: Binding<String>,
        helperText: String? = nil,
        errorText: String? = nil,
        isRequired: Bool = false
    ) -> BPTextField {
        return BPTextField(
            title: title,
            placeholder: placeholder,
            text: text,
            helperText: helperText,
            errorText: errorText,
            inputType: .password,
            isRequired: isRequired,
            leadingIcon: "lock"
        )
    }

    /// Create a search text field
    public static func search(
        placeholder: String = "Search",
        text: Binding<String>,
        onSearchTap: (() -> Void)? = nil
    ) -> BPTextField {
        return BPTextField(
            placeholder: placeholder,
            text: text,
            style: .filled,
            inputType: .search,
            leadingIcon: "magnifyingglass",
            trailingIcon: text.wrappedValue.isEmpty ? nil : "xmark.circle.fill",
            onTrailingIconTap: text.wrappedValue.isEmpty ? onSearchTap : {
                text.wrappedValue = ""
            }
        )
    }

    /// Create a phone number text field
    public static func phone(
        title: String? = nil,
        placeholder: String = "Phone Number",
        text: Binding<String>,
        helperText: String? = nil,
        errorText: String? = nil,
        isRequired: Bool = false
    ) -> BPTextField {
        return BPTextField(
            title: title,
            placeholder: placeholder,
            text: text,
            helperText: helperText,
            errorText: errorText,
            inputType: .phone,
            isRequired: isRequired,
            leadingIcon: "phone"
        )
    }

    /// Create a multiline text area
    public static func textArea(
        title: String? = nil,
        placeholder: String,
        text: Binding<String>,
        helperText: String? = nil,
        errorText: String? = nil,
        minLines: Int = 3,
        maxLines: Int = 8,
        maxLength: Int? = nil,
        isRequired: Bool = false
    ) -> BPTextField {
        return BPTextField(
            title: title,
            placeholder: placeholder,
            text: text,
            helperText: helperText,
            errorText: errorText,
            inputType: .multiline(minLines: minLines, maxLines: maxLines),
            isRequired: isRequired,
            maxLength: maxLength
        )
    }
}

// MARK: - Preview Helpers

@available(iOS 16.0, watchOS 9.0, macOS 13.0, *)
struct BPTextField_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Basic text fields
                VStack(alignment: .leading, spacing: 16) {
                    BPText("Basic Text Fields", style: .sectionTitle)

                    BPTextField(
                        title: "Name",
                        placeholder: "Enter your name",
                        text: .constant(""),
                        helperText: "This field is required",
                        isRequired: true
                    )

                    BPTextField(
                        title: "Optional Field",
                        placeholder: "Optional input",
                        text: .constant(""),
                        style: .filled
                    )
                }

                Divider()

                // Specialized inputs
                VStack(alignment: .leading, spacing: 16) {
                    BPText("Specialized Inputs", style: .sectionTitle)

                    BPTextField.email(
                        title: "Email",
                        text: .constant(""),
                        isRequired: true
                    )

                    BPTextField.password(
                        title: "Password",
                        text: .constant(""),
                        helperText: "Minimum 8 characters",
                        isRequired: true
                    )

                    BPTextField.search(
                        text: .constant("")
                    )

                    BPTextField.phone(
                        title: "Phone Number",
                        text: .constant("")
                    )
                }

                Divider()

                // Error states
                VStack(alignment: .leading, spacing: 16) {
                    BPText("Error States", style: .sectionTitle)

                    BPTextField(
                        title: "Email",
                        placeholder: "Enter your email",
                        text: .constant("invalid-email"),
                        errorText: "Please enter a valid email address",
                        isRequired: true
                    )
                }

                Divider()

                // Text area
                VStack(alignment: .leading, spacing: 16) {
                    BPText("Text Area", style: .sectionTitle)

                    BPTextField.textArea(
                        title: "Notes",
                        placeholder: "Enter your notes here...",
                        text: .constant(""),
                        helperText: "Maximum 500 characters",
                        maxLength: 500
                    )
                }

                Divider()

                // Different sizes
                VStack(alignment: .leading, spacing: 16) {
                    BPText("Different Sizes", style: .sectionTitle)

                    BPTextField(
                        placeholder: "Small",
                        text: .constant(""),
                        size: .small
                    )

                    BPTextField(
                        placeholder: "Medium (default)",
                        text: .constant(""),
                        size: .medium
                    )

                    BPTextField(
                        placeholder: "Large",
                        text: .constant(""),
                        size: .large
                    )
                }
            }
            .padding()
        }
        .beProductiveTheme()
    }
}