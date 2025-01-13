# Code Review Best Practices

## Introduction

Code reviews are a crucial part of the development process, ensuring code quality, knowledge sharing, and team collaboration.

## Review Process

### Before Review

1. Self-review your changes
2. Run tests locally
3. Update documentation
4. Write clear PR description

### During Review

1. Be respectful and constructive
2. Focus on code, not the author
3. Ask questions instead of making demands
4. Provide specific examples

## What to Look For

### Code Quality

- Clean and readable code
- Proper naming conventions
- Function length and complexity
- Code duplication
- Error handling

### Example

```typescript
// Bad
function p(d) {
  return d.map((i) => i.v * 2);
}

// Good
function processData(items: DataItem[]): number[] {
  return items.map((item) => item.value * 2);
}
```

### Security

- Input validation
- Authentication/Authorization
- Data sanitization
- Secure communication
- Environment variables

### Performance

- Database queries
- API calls
- Memory usage
- Caching strategies
- Loop optimization

## Best Practices

### For Reviewers

1. Review within 24 hours
2. Check for edge cases
3. Verify error handling
4. Look for security issues
5. Test the changes locally

### For Authors

1. Keep PRs small
2. Add tests
3. Update documentation
4. Respond promptly
5. Be open to feedback

## Common Pitfalls

### To Avoid

- Large, monolithic PRs
- Missing tests
- Unclear commit messages
- Ignored comments
- Defensive responses

### Example Feedback

```
// Instead of:
"This code is messy"

// Say:
"Consider extracting this logic into a separate function for better readability:
function validateUserInput(input: UserInput): ValidationResult {
  // validation logic
}"
```

## Review Checklist

### General

- [ ] Code follows style guide
- [ ] Tests are added/updated
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered

### Specific

- [ ] Error handling is complete
- [ ] Edge cases are covered
- [ ] Logging is appropriate
- [ ] API contracts are maintained
- [ ] Database migrations are safe
