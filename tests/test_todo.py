# agent-notes: { ctx: "TDD tests for list, done, delete store and CLI commands", deps: ["src/todo/store.py", "src/todo/cli.py"], state: active, last: "tara@2026-07-22" }

"""Tests for the todo app store and CLI commands.

Written by Tara (red phase) to test listing, completing, and CLI commands.
"""

import pytest
import json
import os
import tempfile
from click.testing import CliRunner
from unittest.mock import patch

from todo.store import TodoStore
from todo import cli


class TestAddTodo:
    """Tests for adding a todo item."""

    def setup_method(self):
        """Create a temporary directory for each test."""
        self.tmp_dir = tempfile.mkdtemp()
        self.store_path = os.path.join(self.tmp_dir, "todos.json")
        self.store = TodoStore(self.store_path)

    def teardown_method(self):
        """Clean up the temporary directory."""
        if os.path.exists(self.store_path):
            os.remove(self.store_path)
        os.rmdir(self.tmp_dir)

    def test_add_todo_returns_item_with_id_and_text(self):
        """Adding a todo should return a dict with id, text, and done=False."""
        item = self.store.add("Buy milk")
        assert item["id"] == 1
        assert item["text"] == "Buy milk"
        assert item["done"] is False

    def test_add_todo_auto_increments_id(self):
        """Each added todo should get a unique, incrementing ID."""
        first = self.store.add("Buy milk")
        second = self.store.add("Walk the dog")
        assert first["id"] == 1
        assert second["id"] == 2

    def test_add_todo_persists_to_file(self):
        """Added items should be written to the JSON file."""
        self.store.add("Buy milk")

        with open(self.store_path, "r") as f:
            data = json.load(f)

        assert len(data) == 1
        assert data[0]["text"] == "Buy milk"

    def test_add_todo_survives_reload(self):
        """Items should persist across store instances."""
        self.store.add("Buy milk")

        # Create a new store pointing to the same file
        new_store = TodoStore(self.store_path)
        items = new_store.list_all()

        assert len(items) == 1
        assert items[0]["text"] == "Buy milk"

    def test_add_empty_text_raises_value_error(self):
        """Adding a todo with empty text should raise ValueError."""
        with pytest.raises(ValueError, match="Todo text cannot be empty"):
            self.store.add("")

    def test_add_whitespace_only_text_raises_value_error(self):
        """Adding a todo with whitespace-only text should raise ValueError."""
        with pytest.raises(ValueError, match="Todo text cannot be empty"):
            self.store.add("   ")

    def test_store_creates_file_on_first_add(self):
        """The JSON file should be created on first add, not on init."""
        assert not os.path.exists(self.store_path)
        self.store.add("Buy milk")
        assert os.path.exists(self.store_path)


class TestStoreOperations:
    """Tests for listing, completing, undoing, and deleting todos."""

    def setup_method(self):
        self.tmp_dir = tempfile.mkdtemp()
        self.store_path = os.path.join(self.tmp_dir, "todos.json")
        self.store = TodoStore(self.store_path)

    def teardown_method(self):
        if os.path.exists(self.store_path):
            os.remove(self.store_path)
        os.rmdir(self.tmp_dir)

    def test_list_all_returns_empty_initially(self):
        """list_all should return an empty list when no items are present."""
        assert self.store.list_all() == []

    def test_list_all_returns_added_items(self):
        """list_all should return all added items in order."""
        self.store.add("First task")
        self.store.add("Second task")
        items = self.store.list_all()
        assert len(items) == 2
        assert items[0]["text"] == "First task"
        assert items[1]["text"] == "Second task"

    def test_mark_done_updates_status(self):
        """mark_done should set done=True and persist the change."""
        item = self.store.add("Task to complete")
        updated = self.store.mark_done(item["id"])
        assert updated["done"] is True

        # Verify persistence
        new_store = TodoStore(self.store_path)
        assert new_store.list_all()[0]["done"] is True

    def test_mark_done_raises_for_invalid_id(self):
        """mark_done should raise ValueError for non-existent ID."""
        with pytest.raises(ValueError, match="No todo item with id 999"):
            self.store.mark_done(999)

    def test_mark_undone_updates_status(self):
        """mark_undone should reset done to False."""
        item = self.store.add("Task to toggle")
        self.store.mark_done(item["id"])
        updated = self.store.mark_undone(item["id"])
        assert updated["done"] is False

        # Verify persistence
        new_store = TodoStore(self.store_path)
        assert new_store.list_all()[0]["done"] is False

    def test_mark_undone_raises_for_invalid_id(self):
        """mark_undone should raise ValueError for non-existent ID."""
        with pytest.raises(ValueError, match="No todo item with id 999"):
            self.store.mark_undone(999)

    def test_delete_removes_item(self):
        """delete should remove the item from the list and persist."""
        self.store.add("Keep me")
        delete_item = self.store.add("Delete me")
        assert len(self.store.list_all()) == 2

        self.store.delete(delete_item["id"])
        items = self.store.list_all()
        assert len(items) == 1
        assert items[0]["text"] == "Keep me"

        # Verify persistence
        new_store = TodoStore(self.store_path)
        assert len(new_store.list_all()) == 1

    def test_delete_raises_for_invalid_id(self):
        """delete should raise ValueError for non-existent ID."""
        with pytest.raises(ValueError, match="No todo item with id 999"):
            self.store.delete(999)


class TestTodoCLI:
    """Integration tests for the Click CLI."""

    def setup_method(self):
        self.tmp_dir = tempfile.mkdtemp()
        self.store_path = os.path.join(self.tmp_dir, "todos.json")
        self.runner = CliRunner()
        # Patch the get_store in the cli module to use our temp path
        self.patcher = patch('todo.cli.get_store', return_value=TodoStore(self.store_path))
        self.patcher.start()

    def teardown_method(self):
        self.patcher.stop()
        if os.path.exists(self.store_path):
            os.remove(self.store_path)
        os.rmdir(self.tmp_dir)

    def test_cli_add(self):
        """todo add should print confirmation and persist the item."""
        result = self.runner.invoke(cli.cli, ["add", "New CLI task"])
        assert result.exit_code == 0
        assert "Added todo #1: New CLI task" in result.output

    def test_cli_list_empty(self):
        """todo list should print empty message when no todos exist."""
        result = self.runner.invoke(cli.cli, ["list"])
        assert result.exit_code == 0
        assert "No todos yet." in result.output

    def test_cli_list_populated(self):
        """todo list should display todos formatted correctly."""
        self.runner.invoke(cli.cli, ["add", "First task"])
        self.runner.invoke(cli.cli, ["add", "Second task"])
        
        result = self.runner.invoke(cli.cli, ["list"])
        assert result.exit_code == 0
        # Check formatting: click.echo(f"  [{item['id']}] {item['text']} ({status})")
        assert "  [1] First task (pending)" in result.output
        assert "  [2] Second task (pending)" in result.output

    def test_cli_done(self):
        """todo done should mark item as done."""
        self.runner.invoke(cli.cli, ["add", "Task to complete"])
        
        result = self.runner.invoke(cli.cli, ["done", "1"])
        assert result.exit_code == 0
        assert "Completed todo #1: Task to complete" in result.output

        # Verify it lists as done
        list_result = self.runner.invoke(cli.cli, ["list"])
        assert "  [1] Task to complete (done)" in list_result.output

    def test_cli_done_invalid_id(self):
        """todo done should display an error message and exit with non-zero code for invalid IDs."""
        result = self.runner.invoke(cli.cli, ["done", "999"])
        assert result.exit_code != 0
        assert "No todo item with id 999" in result.output
